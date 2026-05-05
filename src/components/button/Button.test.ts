import { jest } from '@jest/globals';
import { Button } from './Button';

describe('Button', () => {
  test('рендерит <button> с переданной подписью без лишних пробелов', () => {
    const btn = new Button({ label: 'Save' });
    const el = btn.element() as HTMLButtonElement;

    expect(el.tagName).toBe('BUTTON');
    expect(el.textContent?.trim()).toBe('Save');
  });

  test('использует дефолтные class и type, если они не переданы', () => {
    const btn = new Button({ label: 'X' });
    const el = btn.element() as HTMLButtonElement;

    expect(el.className).toBe('button');
    expect(el.getAttribute('type')).toBe('button');
  });

  test('применяет переданные className и type', () => {
    const btn = new Button({
      label: 'Submit',
      className: 'button-primary',
      type: 'submit',
    });
    const el = btn.element() as HTMLButtonElement;

    expect(el.className).toBe('button-primary');
    expect(el.getAttribute('type')).toBe('submit');
  });

  test('пробрасывает события click из props.events', () => {
    const onClick = jest.fn();
    const btn = new Button({ label: 'X', events: { click: onClick } });
    const el = btn.element() as HTMLButtonElement;

    el.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
