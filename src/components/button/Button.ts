import { Block } from '../../framework/Block';
import './button.scss';

interface ButtonProps {
  label?: string;
  type?: string;
  className?: string;
}

export class Button extends Block<ButtonProps> {
  static componentName = 'Button';

  protected template = `
    <button class="{{#if className}}{{className}}{{else}}button{{/if}}" type="{{#if type}}{{type}}{{else}}button{{/if}}">
      {{label}}
    </button>
  `;
}
