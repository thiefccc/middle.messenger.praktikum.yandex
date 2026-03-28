import { Block } from '../../framework/Block';
import { validate } from '../../utils/validation';
import './input.scss';

interface InputProps {
  type?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  className?: string;
  ref?: string;
  noValidation?: boolean;
}

export class Input extends Block<InputProps> {
  static componentName = 'Input';

  protected template = `
    <div class="form-field">
      <input
        class="{{#if className}}{{className}}{{else}}input{{/if}}"
        type="{{#if type}}{{type}}{{else}}text{{/if}}"
        name="{{name}}"
        value="{{value}}"
        placeholder="{{placeholder}}"
        ref="input"
      />
      {{#unless noValidation}}
      {{{ ValidationError }}}
      {{/unless}}
    </div>
  `;

  componentDidMount(): void {
    const input = this.refs['input'] as HTMLInputElement | undefined;
    if (!input) {
      return;
    }

    input.addEventListener('blur', () => {
      this.runValidation();
    });
  }

  public runValidation(): string | null {
    const input = this.refs['input'] as HTMLInputElement | undefined;
    if (!input) {
      return null;
    }

    const { name, value } = input;
    const error = validate(name, value);
    const errorEl = this.element()?.querySelector('.validation-error');

    if (error) {
      input.classList.add('input--error');
      if (errorEl) {
        errorEl.textContent = error;
        errorEl.classList.add('validation-error--visible');
      }
    } else {
      input.classList.remove('input--error');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('validation-error--visible');
      }
    }

    return error;
  }
}
