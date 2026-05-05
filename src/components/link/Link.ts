import { Block } from '../../framework/Block';
import { Router } from '../../framework/Router';
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
    <a class="{{#if className}}{{className}}{{else}}link{{/if}}" href="{{#if page}}{{page}}{{else}}{{#if href}}{{href}}{{else}}#{{/if}}{{/if}}">
      {{label}}
    </a>
  `;

  protected componentDidMount(): void {
    const el = this.element();
    if (!el) return;

    el.addEventListener('click', (e: Event) => {
      const page = this.props.page;
      if (page) {
        e.preventDefault();
        const router = new Router('');
        router.go(page);
      }
    });
  }
}
