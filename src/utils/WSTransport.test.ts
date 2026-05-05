import { jest } from '@jest/globals';
import { WSTransport } from './WSTransport';

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  static CONNECTING = 0 as const;
  static OPEN = 1 as const;
  static CLOSING = 2 as const;
  static CLOSED = 3 as const;

  url: string;
  readyState: number = FakeWebSocket.CONNECTING;
  sent: string[] = [];

  private listeners: Record<string, Array<(e: unknown) => void>> = {};

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(code = 1000): void {
    this.readyState = FakeWebSocket.CLOSED;
    this.dispatch('close', { code, wasClean: code === 1000 });
  }

  addEventListener(event: string, handler: (e: unknown) => void): void {
    (this.listeners[event] ??= []).push(handler);
  }

  removeEventListener(event: string, handler: (e: unknown) => void): void {
    this.listeners[event] = (this.listeners[event] ?? []).filter(
      (h) => h !== handler,
    );
  }

  triggerOpen(): void {
    this.readyState = FakeWebSocket.OPEN;
    this.dispatch('open', {});
  }

  triggerMessage(data: unknown): void {
    this.dispatch('message', {
      data: typeof data === 'string' ? data : JSON.stringify(data),
    });
  }

  triggerError(): void {
    this.dispatch('error', new Event('error'));
  }

  private dispatch(event: string, payload: unknown): void {
    (this.listeners[event] ?? []).slice().forEach((h) => h(payload));
  }
}

const originalWS = (globalThis as unknown as { WebSocket: typeof WebSocket })
  .WebSocket;

beforeEach(() => {
  FakeWebSocket.instances = [];
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = FakeWebSocket;
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = originalWS;
});

describe('WSTransport', () => {
  test('открывает сокет по заданному URL при connect()', async () => {
    const t = new WSTransport('wss://example.com/ws/1/2/abc');
    const promise = t.connect();

    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(FakeWebSocket.instances[0]!.url).toBe(
      'wss://example.com/ws/1/2/abc',
    );

    FakeWebSocket.instances[0]!.triggerOpen();
    await expect(promise).resolves.toBeUndefined();
  });

  test('connect() отклоняется, если сокет упал до открытия', async () => {
    const t = new WSTransport('wss://example.com');
    const promise = t.connect();

    FakeWebSocket.instances[0]!.triggerError();
    await expect(promise).rejects.toBeDefined();
  });

  test('отклоняется при повторном вызове connect() без close', async () => {
    const t = new WSTransport('wss://example.com');
    void t.connect();

    await expect(t.connect()).rejects.toThrow(/already open/);
  });

  test('вызывает колбэк onOpen при открытии сокета', async () => {
    const t = new WSTransport('wss://example.com');
    const onOpen = jest.fn();
    t.onOpen = onOpen;

    void t.connect();
    FakeWebSocket.instances[0]!.triggerOpen();

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  test('парсит JSON-сообщения и вызывает onMessage', async () => {
    const t = new WSTransport('wss://example.com');
    const onMessage = jest.fn();
    t.onMessage = onMessage;

    const promise = t.connect();
    FakeWebSocket.instances[0]!.triggerOpen();
    await promise;

    FakeWebSocket.instances[0]!.triggerMessage({
      id: '1',
      content: 'hi',
      type: 'message',
    });

    expect(onMessage).toHaveBeenCalledWith({
      id: '1',
      content: 'hi',
      type: 'message',
    });
  });

  test('не вызывает onMessage для pong-фреймов', async () => {
    const t = new WSTransport('wss://example.com');
    const onMessage = jest.fn();
    t.onMessage = onMessage;

    const promise = t.connect();
    FakeWebSocket.instances[0]!.triggerOpen();
    await promise;

    FakeWebSocket.instances[0]!.triggerMessage({ type: 'pong' });

    expect(onMessage).not.toHaveBeenCalled();
  });

  test('тихо игнорирует невалидные (не-JSON) фреймы', async () => {
    const t = new WSTransport('wss://example.com');
    const onMessage = jest.fn();
    t.onMessage = onMessage;

    const promise = t.connect();
    FakeWebSocket.instances[0]!.triggerOpen();
    await promise;

    expect(() =>
      FakeWebSocket.instances[0]!.triggerMessage('not-json'),
    ).not.toThrow();
    expect(onMessage).not.toHaveBeenCalled();
  });

  test('send() сериализует объекты в JSON', async () => {
    const t = new WSTransport('wss://example.com');
    const promise = t.connect();
    FakeWebSocket.instances[0]!.triggerOpen();
    await promise;

    t.send({ type: 'message', content: 'hi' });

    expect(FakeWebSocket.instances[0]!.sent).toContain(
      JSON.stringify({ type: 'message', content: 'hi' }),
    );
  });

  test('send() передаёт строки как есть', async () => {
    const t = new WSTransport('wss://example.com');
    const promise = t.connect();
    FakeWebSocket.instances[0]!.triggerOpen();
    await promise;

    t.send('raw');
    expect(FakeWebSocket.instances[0]!.sent).toContain('raw');
  });

  test('send() бросает исключение, если сокет не открыт', () => {
    const t = new WSTransport('wss://example.com');
    expect(() => t.send({})).toThrow(/not open/);
  });

  test('отправляет ping-фрейм раз в 30 секунд, пока сокет открыт', async () => {
    const t = new WSTransport('wss://example.com');
    const promise = t.connect();
    const ws = FakeWebSocket.instances[0]!;
    ws.triggerOpen();
    await promise;

    jest.advanceTimersByTime(30_000);
    expect(ws.sent).toEqual([JSON.stringify({ type: 'ping' })]);

    jest.advanceTimersByTime(30_000);
    expect(ws.sent).toEqual([
      JSON.stringify({ type: 'ping' }),
      JSON.stringify({ type: 'ping' }),
    ]);
  });

  test('перестаёт пинговать после close', async () => {
    const t = new WSTransport('wss://example.com');
    const promise = t.connect();
    const ws = FakeWebSocket.instances[0]!;
    ws.triggerOpen();
    await promise;

    t.close();

    jest.advanceTimersByTime(60_000);
    expect(ws.sent).toEqual([]);
  });

  test('вызывает onClose при закрытии нативного сокета', async () => {
    const t = new WSTransport('wss://example.com');
    const onClose = jest.fn();
    t.onClose = onClose;

    const promise = t.connect();
    const ws = FakeWebSocket.instances[0]!;
    ws.triggerOpen();
    await promise;

    ws.close(1006);
    expect(onClose).toHaveBeenCalled();
  });

  test('вызывает onError для ошибок после успешного connect', async () => {
    const t = new WSTransport('wss://example.com');
    const onError = jest.fn();
    t.onError = onError;

    const promise = t.connect();
    const ws = FakeWebSocket.instances[0]!;
    ws.triggerOpen();
    await promise;

    ws.triggerError();
    expect(onError).toHaveBeenCalled();
  });

  test('не вызывает onError при ошибке первичного connect()', async () => {
    const t = new WSTransport('wss://example.com');
    const onError = jest.fn();
    t.onError = onError;

    const promise = t.connect();
    FakeWebSocket.instances[0]!.triggerError();
    await expect(promise).rejects.toBeDefined();

    expect(onError).not.toHaveBeenCalled();
  });

  test('isOpen отражает readyState нативного сокета', async () => {
    const t = new WSTransport('wss://example.com');
    expect(t.isOpen()).toBe(false);

    const promise = t.connect();
    const ws = FakeWebSocket.instances[0]!;
    expect(t.isOpen()).toBe(false);

    ws.triggerOpen();
    await promise;
    expect(t.isOpen()).toBe(true);

    t.close();
    expect(t.isOpen()).toBe(false);
  });
});
