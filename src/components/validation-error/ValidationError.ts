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
}
