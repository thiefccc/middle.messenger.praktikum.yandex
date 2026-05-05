import { Block } from './Block';
import { Route } from './Route';

type Guard = (pathname: string) => string | null;

export class Router {
  private static instance: Router;
  private routes!: Route[];
  private history!: History;
  private currentRoute!: Route | null;
  private rootQuery!: string;
  private guard?: Guard;
  private fallback?: string;

  constructor(rootQuery: string) {
    if (Router.instance) {
      return Router.instance;
    }

    this.routes = [];
    this.history = window.history;
    this.currentRoute = null;
    this.rootQuery = rootQuery;

    Router.instance = this;
  }

  use(pathname: string, block: new () => Block): this {
    const route = new Route(pathname, block, { rootQuery: this.rootQuery });
    this.routes.push(route);
    return this;
  }

  setGuard(guard: Guard): this {
    this.guard = guard;
    return this;
  }

  setFallback(pathname: string): this {
    this.fallback = pathname;
    return this;
  }

  start(): void {
    window.onpopstate = (event: PopStateEvent) => {
      const target = event.currentTarget as Window;
      this.onRoute(target.location.pathname);
    };

    this.onRoute(window.location.pathname);
  }

  private normalizePath(pathname: string): string {
    return pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  }

  private onRoute(pathname: string): void {
    let normalizedPath = this.normalizePath(pathname);

    if (this.guard) {
      const redirect = this.guard(normalizedPath);
      if (redirect && redirect !== normalizedPath) {
        this.history.replaceState({}, '', redirect);
        normalizedPath = this.normalizePath(redirect);
      }
    }

    let route = this.getRoute(normalizedPath);
    if (!route && this.fallback) {
      this.history.replaceState({}, '', this.fallback);
      route = this.getRoute(this.fallback);
    }

    if (this.currentRoute && this.currentRoute === route) {
      return;
    }

    if (this.currentRoute) {
      this.currentRoute.leave();
    }

    if (!route) {
      return;
    }

    this.currentRoute = route;
    this.currentRoute.render();
    this.attachDataPageLinks();
  }

  private attachDataPageLinks(): void {
    const root = document.querySelector(this.rootQuery);
    if (!root) {
      return;
    }

    root.querySelectorAll('[data-page]').forEach((el) => {
      el.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const target = (e.currentTarget as HTMLElement).dataset.page;
        if (target) {
          this.go(target);
        }
      });
    });

    root.querySelectorAll('[data-back]').forEach((el) => {
      el.addEventListener('click', (e: Event) => {
        e.preventDefault();
        this.back();
      });
    });

    root.querySelectorAll('[data-forward]').forEach((el) => {
      el.addEventListener('click', (e: Event) => {
        e.preventDefault();
        this.forward();
      });
    });
  }

  go(pathname: string): void {
    this.history.pushState({}, '', pathname);
    this.onRoute(pathname);
  }

  back(): void {
    this.history.back();
  }

  forward(): void {
    this.history.forward();
  }

  getRoute(pathname: string): Route | undefined {
    return this.routes.find((route) => route.match(pathname));
  }

  getParams(): Record<string, string | undefined> {
    return this.currentRoute?.getParams() ?? {};
  }
}
