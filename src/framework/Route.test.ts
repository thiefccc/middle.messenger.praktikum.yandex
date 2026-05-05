import { Block } from './Block';
import { Route } from './Route';

class StubBlock extends Block {
  protected template = '<div>stub</div>';
}

const ROOT = '#app';

describe('Route', () => {
  describe('статические пути', () => {
    test('совпадает с точным pathname', () => {
      const route = new Route('/login', StubBlock, { rootQuery: ROOT });
      expect(route.match('/login')).toBe(true);
    });

    test('не совпадает с другим pathname', () => {
      const route = new Route('/login', StubBlock, { rootQuery: ROOT });
      expect(route.match('/signup')).toBe(false);
    });

    test('не совпадает с частичным префиксом', () => {
      const route = new Route('/foo', StubBlock, { rootQuery: ROOT });
      expect(route.match('/foo/bar')).toBe(false);
    });

    test('очищает ранее извлечённые параметры при несовпадении', () => {
      const route = new Route('/users/:id', StubBlock, { rootQuery: ROOT });
      route.match('/users/42');
      expect(route.getParams().id).toBe('42');

      route.match('/posts');
      expect(route.getParams()).toEqual({});
    });
  });

  describe('параметризованные паттерны', () => {
    test('извлекает обязательный параметр', () => {
      const route = new Route('/users/:id', StubBlock, { rootQuery: ROOT });
      expect(route.match('/users/42')).toBe(true);
      expect(route.getParams()).toEqual({ id: '42' });
    });

    test('не совпадает, когда обязательный параметр отсутствует', () => {
      const route = new Route('/users/:id', StubBlock, { rootQuery: ROOT });
      expect(route.match('/users')).toBe(false);
    });

    test('совпадает без опционального параметра', () => {
      const route = new Route('/messenger/:chatId?', StubBlock, {
        rootQuery: ROOT,
      });
      expect(route.match('/messenger')).toBe(true);
      expect(route.getParams()).toEqual({ chatId: undefined });
    });

    test('совпадает с опциональным параметром', () => {
      const route = new Route('/messenger/:chatId?', StubBlock, {
        rootQuery: ROOT,
      });
      expect(route.match('/messenger/116995')).toBe(true);
      expect(route.getParams()).toEqual({ chatId: '116995' });
    });

    test('извлекает несколько параметров из одного пути', () => {
      const route = new Route('/users/:userId/posts/:postId', StubBlock, {
        rootQuery: ROOT,
      });
      expect(route.match('/users/7/posts/13')).toBe(true);
      expect(route.getParams()).toEqual({ userId: '7', postId: '13' });
    });
  });
});
