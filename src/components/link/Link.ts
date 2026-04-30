import { Block } from '../../framework/Block';
import './link.scss';

interface LinkProps {
  label?: string;
  href?: string;
  page?: string;
  className?: string;
}

export class Link extends Block<LinkProps> {
  static componentName = 'Link';

  protected template = `
    <a class="{{#if className}}{{className}}{{else}}link{{/if}}" href="{{#if href}}{{href}}{{else}}#{{/if}}" {{#if page}}data-page="{{page}}"{{/if}}>
      {{label}}
    </a>
  `;
}
