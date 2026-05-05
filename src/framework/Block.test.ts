import { jest } from '@jest/globals';
import { Block } from './Block';

interface SimpleProps extends Record<string, unknown> {
  label?: string;
  count?: number;
}

class SimpleBlock extends Block<SimpleProps> {
  public mountCount = 0;
  public unmountCount = 0;

  protected template = `
    <div class="simple" ref="root">
      <span class="simple__label">{{label}}</span>
      <span class="simple__count">{{count}}</span>
    </div>
  `;

  protected componentDidMount(): void {
    this.mountCount += 1;
  }

  protected componentWillUnmount(): void {
    this.unmountCount += 1;
  }

  public getRefs(): Record<string, Element> {
    return this.refs;
  }
}

describe('Block', () => {
  describe('рендеринг', () => {
    test('компилирует шаблон с начальными пропсами', () => {
      const block = new SimpleBlock({ label: 'hi', count: 1 });
      const root = block.element();

      expect(root?.querySelector('.simple__label')?.textContent).toBe('hi');
      expect(root?.querySelector('.simple__count')?.textContent).toBe('1');
    });

    test('setProps ре-рендерит с объединёнными пропсами и заменяет DOM-элемент', () => {
      const block = new SimpleBlock({ label: 'a', count: 1 });
      const before = block.element();
      expect(before?.querySelector('.simple__label')?.textContent).toBe('a');

      block.setProps({ label: 'b' });
      const after = block.element();

      expect(after).not.toBe(before);
      expect(after?.querySelector('.simple__label')?.textContent).toBe('b');
      expect(after?.querySelector('.simple__count')?.textContent).toBe('1');
    });

    test('экранирует HTML-сущности в интерполируемых значениях (XSS-safe по умолчанию)', () => {
      const block = new SimpleBlock({
        label: '<img src=x onerror="alert(1)" />',
      });
      const html =
        block.element()?.querySelector('.simple__label')?.innerHTML ?? '';

      expect(html).not.toContain('<img');
      expect(html).toContain('&lt;img');
    });
  });

  describe('жизненный цикл', () => {
    test('componentDidMount вызывается после первого рендера', () => {
      const block = new SimpleBlock({ label: 'hello' });
      block.element();

      expect(block.mountCount).toBe(1);
    });

    test('setProps размонтирует старое поддерево перед повторным монтированием', () => {
      const block = new SimpleBlock({ label: 'a' });
      block.element();

      block.setProps({ label: 'b' });

      expect(block.unmountCount).toBe(1);
      expect(block.mountCount).toBe(2);
    });

    test('unmountComponent вызывает componentWillUnmount', () => {
      const block = new SimpleBlock({ label: 'a' });
      block.element();

      block.unmountComponent();

      expect(block.unmountCount).toBe(1);
    });
  });

  describe('события', () => {
    test('навешивает обработчик click из props.events', () => {
      const onClick = jest.fn();
      const block = new SimpleBlock({
        label: 'btn',
        events: { click: onClick },
      });
      const el = block.element() as HTMLElement;

      el.click();
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('снимает обработчик при ре-рендере', () => {
      const onClick = jest.fn();
      const block = new SimpleBlock({
        label: 'btn',
        events: { click: onClick },
      });
      const oldEl = block.element() as HTMLElement;

      block.setProps({ label: 'btn2' });

      oldEl.click();
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('refs', () => {
    test('собирает элементы с атрибутом ref="..." и удаляет сам атрибут', () => {
      const block = new SimpleBlock({ label: 'a' });
      block.element();

      const refs = block.getRefs();
      expect(refs.root).toBeInstanceOf(HTMLElement);
      expect(refs.root.classList.contains('simple')).toBe(true);
      expect(refs.root.hasAttribute('ref')).toBe(false);
    });
  });
});
