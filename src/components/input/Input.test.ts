import { Input } from './Input';
import { ValidationError } from '../validation-error/ValidationError';
import { registerComponent } from '../../framework/registerComponent';

beforeAll(() => {
  registerComponent(ValidationError);
});

describe('Input', () => {
  test('рендерит <input> с переданными name, type и value', () => {
    const block = new Input({
      name: 'login',
      type: 'text',
      value: 'foo',
      noValidation: true,
    });
    const root = block.element() as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;

    expect(input.name).toBe('login');
    expect(input.type).toBe('text');
    expect(input.value).toBe('foo');
  });

  test('использует дефолтные class и type, если они не переданы', () => {
    const block = new Input({ name: 'x', noValidation: true });
    const input = block.element()!.querySelector('input') as HTMLInputElement;

    expect(input.className).toBe('input');
    expect(input.type).toBe('text');
  });

  test('runValidation показывает ошибку для невалидного ввода', () => {
    const block = new Input({ name: 'login', value: 'a' });
    const root = block.element() as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;
    input.value = 'a';

    const error = block.runValidation();

    expect(error).not.toBeNull();
    expect(input.classList.contains('input--error')).toBe(true);
    expect(root.querySelector('.validation-error')?.textContent).toBe(error);
  });

  test('runValidation сбрасывает ошибку для валидного значения', () => {
    const block = new Input({ name: 'login' });
    const root = block.element() as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;

    input.value = 'a';
    block.runValidation();
    expect(input.classList.contains('input--error')).toBe(true);

    input.value = 'valid_user';
    const error = block.runValidation();

    expect(error).toBeNull();
    expect(input.classList.contains('input--error')).toBe(false);
    expect(root.querySelector('.validation-error')?.textContent).toBe('');
  });

  test('событие blur запускает валидацию', () => {
    const block = new Input({ name: 'login', value: '!' });
    const root = block.element() as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;

    input.dispatchEvent(new FocusEvent('blur'));

    expect(input.classList.contains('input--error')).toBe(true);
  });

  test('noValidation скрывает блок для ошибки валидации', () => {
    const block = new Input({ name: 'x', noValidation: true });
    const root = block.element() as HTMLElement;

    expect(root.querySelector('.validation-error')).toBeNull();
  });
});
