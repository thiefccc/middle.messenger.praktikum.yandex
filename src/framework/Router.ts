import { Block } from './Block';

interface Route {
  create: () => Block;
}

export class Router {
  private routes: Record<string, Route> = {};
  private rootElement: HTMLElement;
  private currentPage: Block | null = null;

  constructor(rootSelector: string) {
    const root = document.querySelector(rootSelector);
    if (!root) {
      throw new Error(`Root element "${rootSelector}" not found`);
    }
    this.rootElement = root as HTMLElement;
  }

  addRoute(name: string, route: Route): this {
    this.routes[name] = route;
    return this;
  }

  navigate(page: string): void {
    const route = this.routes[page];
    if (!route) {
      this.navigate('error404');
      return;
    }

    window.location.hash = page;

    this.currentPage = route.create();
    const element = this.currentPage.element();
    if (element) {
      this.rootElement.innerHTML = '';
      this.rootElement.appendChild(element);
    }

    this.attachNavLinks();
  }

  start(): void {
    const page = this.getPageFromHash();
    this.navigate(page);

    window.addEventListener('hashchange', () => {
      this.navigate(this.getPageFromHash());
    });
  }

  private getPageFromHash(): string {
    const hash = window.location.hash.slice(1);
    return hash && this.routes[hash] ? hash : 'login';
  }

  private attachNavLinks(): void {
    this.rootElement.querySelectorAll('[data-page]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = (e.currentTarget as HTMLElement).dataset.page;
        if (target) {
          this.navigate(target);
        }
      });
    });
  }
}
