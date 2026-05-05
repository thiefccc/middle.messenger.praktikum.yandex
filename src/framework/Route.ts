import { Block } from './Block';
import { render } from '../utils/renderDOM';

interface RouteProps {
  rootQuery: string;
}

interface CompiledPattern {
  regex: RegExp;
  keys: string[];
}

function compilePattern(pattern: string): CompiledPattern {
  const keys: string[] = [];
  const regexStr = pattern.replace(/\/:(\w+)(\?)?/g, (_, key: string, optional?: string) => {
    keys.push(key);
    return optional ? '(?:/([^/]+))?' : '/([^/]+)';
  });
  return { regex: new RegExp(`^${regexStr}$`), keys };
}

export class Route {
  private blockClass: new () => Block;
  private block: Block | null;
  private props: RouteProps;
  private pattern: CompiledPattern;
  private params: Record<string, string | undefined> = {};

  constructor(pathname: string, view: new () => Block, props: RouteProps) {
    this.blockClass = view;
    this.block = null;
    this.props = props;
    this.pattern = compilePattern(pathname);
  }

  leave(): void {
    if (this.block) {
      this.block.unmountComponent();
      this.block = null;
    }
  }

  match(pathname: string): boolean {
    const result = this.pattern.regex.exec(pathname);
    if (!result) {
      this.params = {};
      return false;
    }

    const params: Record<string, string | undefined> = {};
    this.pattern.keys.forEach((key, index) => {
      params[key] = result[index + 1];
    });
    this.params = params;
    return true;
  }

  getParams(): Record<string, string | undefined> {
    return this.params;
  }

  render(): void {
    this.block = new this.blockClass();
    render(this.props.rootQuery, this.block);
  }
}
