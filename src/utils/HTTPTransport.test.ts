import HTTPTransport, { type HTTPError } from './HTTPTransport';

class FakeXHR {
  static instances: FakeXHR[] = [];

  status = 0;
  statusText = '';
  responseText = '';
  response: unknown = null;
  responseType: XMLHttpRequestResponseType = '';
  withCredentials = false;
  timeout = 0;

  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onabort: (() => void) | null = null;

  openCalls: Array<[string, string]> = [];
  sendCalls: unknown[] = [];
  headersSent: Record<string, string> = {};
  responseHeaders: Record<string, string> = {};

  constructor() {
    FakeXHR.instances.push(this);
  }

  open(method: string, url: string): void {
    this.openCalls.push([method, url]);
  }

  setRequestHeader(name: string, value: string): void {
    this.headersSent[name] = value;
  }

  send(body?: unknown): void {
    this.sendCalls.push(body);
  }

  getResponseHeader(name: string): string | null {
    return this.responseHeaders[name] ?? null;
  }

  resolveWith(
    opts: {
      status?: number;
      body?: string;
      contentType?: string;
      response?: unknown;
    } = {},
  ): void {
    this.status = opts.status ?? 200;
    this.statusText = `Status ${this.status}`;
    if (opts.body !== undefined) {
      this.responseText = opts.body;
    }
    if (opts.response !== undefined) {
      this.response = opts.response;
    }
    if (opts.contentType) {
      this.responseHeaders['Content-Type'] = opts.contentType;
    }
    this.onload?.();
  }

  rejectWith(opts: { status?: number; body?: string } = {}): void {
    this.status = opts.status ?? 500;
    this.statusText = `Status ${this.status}`;
    if (opts.body !== undefined) {
      this.responseText = opts.body;
    }
    this.onload?.();
  }
}

const originalXHR = globalThis.XMLHttpRequest;

beforeEach(() => {
  FakeXHR.instances = [];
  (globalThis as unknown as { XMLHttpRequest: typeof FakeXHR }).XMLHttpRequest =
    FakeXHR;
});

afterEach(() => {
  (
    globalThis as unknown as { XMLHttpRequest: typeof XMLHttpRequest }
  ).XMLHttpRequest = originalXHR;
});

describe('HTTPTransport', () => {
  describe('базовая форма запроса', () => {
    test('GET добавляет baseUrl и выставляет withCredentials', async () => {
      const http = new HTTPTransport('https://api.example.com/v1');
      const promise = http.get('/users');

      const xhr = FakeXHR.instances[0]!;
      expect(xhr.openCalls).toEqual([
        ['GET', 'https://api.example.com/v1/users'],
      ]);
      expect(xhr.withCredentials).toBe(true);

      xhr.resolveWith({ body: '[]', contentType: 'application/json' });
      await expect(promise).resolves.toEqual([]);
    });

    test('по умолчанию использует пустой baseUrl', async () => {
      const http = new HTTPTransport();
      void http.get('/foo');

      expect(FakeXHR.instances[0]!.openCalls).toEqual([['GET', '/foo']]);
    });

    test('применяет пользовательские заголовки запроса', () => {
      const http = new HTTPTransport();
      void http.post('/foo', { headers: { 'X-Custom': '42' }, data: { a: 1 } });

      const xhr = FakeXHR.instances[0]!;
      expect(xhr.headersSent['X-Custom']).toBe('42');
    });
  });

  describe('query-строка для GET', () => {
    test('добавляет ?ключ=значение для object data', () => {
      const http = new HTTPTransport('');
      void http.get('/users', { data: { page: 2, limit: 10 } });

      const [, url] = FakeXHR.instances[0]!.openCalls[0]!;
      expect(url).toMatch(/^\/users\?/);
      expect(url).toContain('page=2');
      expect(url).toContain('limit=10');
    });

    test('не добавляет query-строку для FormData', () => {
      const http = new HTTPTransport('');
      const fd = new FormData();
      fd.append('k', 'v');
      void http.get('/users', { data: fd });

      const [, url] = FakeXHR.instances[0]!.openCalls[0]!;
      expect(url).toBe('/users');
    });

    test('не добавляет query-строку, если data не передана', () => {
      const http = new HTTPTransport('');
      void http.get('/users');

      const [, url] = FakeXHR.instances[0]!.openCalls[0]!;
      expect(url).toBe('/users');
    });
  });

  describe('тела запросов POST/PUT/DELETE', () => {
    test('сериализует объект в JSON и проставляет Content-Type, если он не задан', () => {
      const http = new HTTPTransport('');
      void http.post('/x', { data: { a: 1, b: 'two' } });

      const xhr = FakeXHR.instances[0]!;
      expect(xhr.headersSent['Content-Type']).toBe('application/json');
      expect(xhr.sendCalls[0]).toBe(JSON.stringify({ a: 1, b: 'two' }));
    });

    test('сохраняет Content-Type, заданный вызывающим кодом', () => {
      const http = new HTTPTransport('');
      void http.post('/x', {
        headers: { 'Content-Type': 'text/plain' },
        data: { a: 1 },
      });

      const xhr = FakeXHR.instances[0]!;
      expect(xhr.headersSent['Content-Type']).toBe('text/plain');
    });

    test('отпралвяет FormData как есть и не выставляет Content-Type', () => {
      const http = new HTTPTransport('');
      const fd = new FormData();
      void http.put('/x', { data: fd });

      const xhr = FakeXHR.instances[0]!;
      expect(xhr.sendCalls[0]).toBe(fd);
      expect(xhr.headersSent['Content-Type']).toBeUndefined();
    });

    test('отпралвяет запрос без тела, если data не передана', () => {
      const http = new HTTPTransport('');
      void http.delete('/x');

      const xhr = FakeXHR.instances[0]!;
      expect(xhr.sendCalls[0]).toBeUndefined();
    });

    test('отпралвяет строковые данные как есть', () => {
      const http = new HTTPTransport('');
      void http.post('/x', { data: 'raw-body' });

      const xhr = FakeXHR.instances[0]!;
      expect(xhr.sendCalls[0]).toBe('raw-body');
    });
  });

  describe('маршрутизация HTTP-методов', () => {
    test.each([
      ['get', 'GET'],
      ['post', 'POST'],
      ['put', 'PUT'],
      ['delete', 'DELETE'],
    ] as const)('%s() открывает соединение методом %s', (fn, method) => {
      const http = new HTTPTransport('');
      void http[fn]('/x');
      expect(FakeXHR.instances[0]!.openCalls[0]![0]).toBe(method);
    });
  });

  describe('разбор ответа', () => {
    test('парсит JSON, если Content-Type равен application/json', async () => {
      const http = new HTTPTransport('');
      const p = http.get<{ id: number }>('/x');

      FakeXHR.instances[0]!.resolveWith({
        body: '{"id":7}',
        contentType: 'application/json; charset=utf-8',
      });

      await expect(p).resolves.toEqual({ id: 7 });
    });

    test('возвращает сырой текст, если Content-Type не JSON', async () => {
      const http = new HTTPTransport('');
      const p = http.get<string>('/x');

      FakeXHR.instances[0]!.resolveWith({
        body: 'plain text',
        contentType: 'text/plain',
      });

      await expect(p).resolves.toBe('plain text');
    });

    test('возвращает сырой текст, если JSON-парсинг падает', async () => {
      const http = new HTTPTransport('');
      const p = http.get<string>('/x');

      FakeXHR.instances[0]!.resolveWith({
        body: 'not-json',
        contentType: 'application/json',
      });

      await expect(p).resolves.toBe('not-json');
    });
  });

  describe('обработка ошибок', () => {
    test('отклоняется при не-2xx статусе', async () => {
      const http = new HTTPTransport('');
      const p = http.get('/x');

      FakeXHR.instances[0]!.rejectWith({
        status: 401,
        body: '{"reason":"nope"}',
      });

      await expect(p).rejects.toMatchObject<Partial<HTTPError>>({
        status: 401,
        response: '{"reason":"nope"}',
      });
    });

    test('отклоняется при сетевой ошибке', async () => {
      const http = new HTTPTransport('');
      const p = http.get('/x');

      FakeXHR.instances[0]!.onerror?.();
      await expect(p).rejects.toMatchObject({ reason: 'Network error' });
    });

    test('отклоняется при тайм-ауте', async () => {
      const http = new HTTPTransport('');
      const p = http.get('/x');

      FakeXHR.instances[0]!.ontimeout?.();
      await expect(p).rejects.toMatchObject({ reason: 'Request timeout' });
    });

    test('отклоняется при abort', async () => {
      const http = new HTTPTransport('');
      const p = http.get('/x');

      FakeXHR.instances[0]!.onabort?.();
      await expect(p).rejects.toMatchObject({ reason: 'Request aborted' });
    });

    test('использует заданный timeout', () => {
      const http = new HTTPTransport('');
      void http.get('/x', { timeout: 1234 });

      expect(FakeXHR.instances[0]!.timeout).toBe(1234);
    });
  });
});
