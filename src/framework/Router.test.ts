import { jest } from '@jest/globals';
import { Block } from './Block';
import { Router } from './Router';

const ROOT_QUERY = '#app';

class HomePage extends Block {
  protected template = '<div data-page-name="home">home</div>';
}

class LoginPage extends Block {
  protected template = '<div data-page-name="login">login</div>';
}

class MessengerPage extends Block {
  protected template = '<div data-page-name="messenger">messenger</div>';
}

class NotFoundPage extends Block {
  protected template = '<div data-page-name="404">not found</div>';
}

function resetSingleton(): void {
  (Router as unknown as { instance?: Router }).instance = undefined;
}

function setupDom(): void {
  document.body.innerHTML = `<div id="app"></div>`;
}

function navigate(pathname: string): void {
  window.history.replaceState({}, '', pathname);
}

function getRenderedPage(): string | null {
  const root = document.querySelector(ROOT_QUERY);
  return (
    root?.querySelector('[data-page-name]')?.getAttribute('data-page-name') ??
    null
  );
}

describe('Router', () => {
  beforeEach(() => {
    resetSingleton();
    setupDom();
    window.onpopstate = null;
    navigate('/');
  });

  describe('синглтон', () => {
    test('возвращает тот же инстанс при повторном вызове конструктора', () => {
      const a = new Router(ROOT_QUERY);
      const b = new Router('#different');
      expect(b).toBe(a);
    });
  });

  describe('use() и start()', () => {
    test('use() поддерживает чейнинг', () => {
      const router = new Router(ROOT_QUERY);
      expect(router.use('/', HomePage as never)).toBe(router);
      expect(router.use('/login', LoginPage as never)).toBe(router);
    });

    test('start() рендерит маршрут, совпадающий с текущим pathname', () => {
      navigate('/login');

      const router = new Router(ROOT_QUERY);
      router.use('/', HomePage as never).use('/login', LoginPage as never);
      router.start();

      expect(getRenderedPage()).toBe('login');
    });

    test('start() справляется с трейлинг слешем', () => {
      navigate('/login/');

      const router = new Router(ROOT_QUERY);
      router.use('/login', LoginPage as never).start();

      expect(getRenderedPage()).toBe('login');
    });
  });

  describe('навигация', () => {
    test('go() добавляет запись в history и рендерит совпавший маршрут', () => {
      const router = new Router(ROOT_QUERY);
      router
        .use('/', HomePage as never)
        .use('/messenger/:chatId?', MessengerPage as never)
        .start();

      router.go('/messenger');

      expect(window.location.pathname).toBe('/messenger');
      expect(getRenderedPage()).toBe('messenger');
    });

    test('переход на тот же маршрут не вызывает ре-рендер', () => {
      const router = new Router(ROOT_QUERY);
      router.use('/', HomePage as never).start();

      const before = document.querySelector(ROOT_QUERY)?.firstElementChild;
      router.go('/');
      const after = document.querySelector(ROOT_QUERY)?.firstElementChild;

      expect(after).toBe(before);
    });
  });

  describe('guard', () => {
    test('редиректит, если guard возвращает не-null pathname', () => {
      navigate('/messenger');

      const router = new Router(ROOT_QUERY);
      router
        .use('/', LoginPage as never)
        .use('/messenger', MessengerPage as never)
        .setGuard(() => '/');

      router.start();

      expect(window.location.pathname).toBe('/');
      expect(getRenderedPage()).toBe('login');
    });

    test('не редиректит, если guard возвращает null', () => {
      navigate('/messenger');

      const router = new Router(ROOT_QUERY);
      router.use('/messenger', MessengerPage as never).setGuard(() => null);

      router.start();

      expect(window.location.pathname).toBe('/messenger');
      expect(getRenderedPage()).toBe('messenger');
    });

    test('не зацикливается, если guard возвращает тот же pathname', () => {
      navigate('/login');
      const guard = jest.fn(() => '/login');

      const router = new Router(ROOT_QUERY);
      router
        .use('/login', LoginPage as never)
        .setGuard(guard)
        .start();

      expect(getRenderedPage()).toBe('login');
      expect(guard).toHaveBeenCalledTimes(1);
    });
  });

  describe('fallback', () => {
    test('использует fallback, когда ни один маршрут не совпал', () => {
      navigate('/this-does-not-exist');

      const router = new Router(ROOT_QUERY);
      router
        .use('/', HomePage as never)
        .use('/404', NotFoundPage as never)
        .setFallback('/404');

      router.start();

      expect(window.location.pathname).toBe('/404');
      expect(getRenderedPage()).toBe('404');
    });

    test('без fallback неизвестный маршрут ничего не рендерит', () => {
      navigate('/missing');

      const router = new Router(ROOT_QUERY);
      router.use('/', HomePage as never).start();

      expect(getRenderedPage()).toBeNull();
    });
  });

  describe('параметры маршрута', () => {
    test('getParams() возвращает параметры активного маршрута', () => {
      navigate('/messenger/116995');

      const router = new Router(ROOT_QUERY);
      router.use('/messenger/:chatId?', MessengerPage as never).start();

      expect(router.getParams()).toEqual({ chatId: '116995' });
    });

    test('getParams() возвращает undefined chatId для опционального параметра', () => {
      navigate('/messenger');

      const router = new Router(ROOT_QUERY);
      router.use('/messenger/:chatId?', MessengerPage as never).start();

      expect(router.getParams()).toEqual({ chatId: undefined });
    });
  });
});
