import { Block } from '../../framework/Block';
import './validation-error.scss';

interface ValidationErrorProps {
  errorMessage?: string;
}

export class ValidationError extends Block<ValidationErrorProps> {
  static componentName = 'ValidationError';

  protected template = `
    <span class="validation-error" ref="errorText">{{errorMessage}}</span>
  `;

  public show(message: string): void {
    const el = this.element();
    if (el) {
      el.textContent = message;
      el.classList.add('validation-error--visible');
    }
  }

  public hide(): void {
    const el = this.element();
    if (el) {
      el.textContent = '';
      el.classList.remove('validation-error--visible');
    }
  }
}
