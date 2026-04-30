import Handlebars from 'handlebars';

type EventListType = Record<string, (e: Event) => void>;

export interface BlockOwnProps {
  __children?: Array<{
    component: Block;
    embed(node: DocumentFragment): void;
  }>;
  __refs?: Record<string, Element>;
  events?: EventListType;
}

type BlockProps<T extends object = object> = T & BlockOwnProps;

export abstract class Block<Props extends object = object> {
  protected abstract template: string;

  protected props = {} as BlockProps<Props>;

  private domElement: Element | null = null;

  protected children: Block[] = [];

  protected refs: Record<string, Element> = {};

  constructor(props: BlockProps<Props> = {} as BlockProps<Props>) {
    this.props = props;
  }

  public element(): Element | null {
    if (!this.domElement) {
      this.render();
    }
    return this.domElement;
  }

  public setProps(props: Partial<Props>): void {
    this.props = { ...this.props, ...props, __children: [], __refs: {} } as BlockProps<Props>;
    this.render();
  }

  protected componentDidMount(): void {}

  private mountComponent(): void {
    this.addEvents();
    this.componentDidMount();
  }

  protected componentWillUnmount(): void {}

  protected unmountComponent(): void {
    if (this.domElement) {
      this.children.reverse().forEach((child) => child.unmountComponent());

      this.componentWillUnmount();
      this.removeEvents();
    }
  }

  private addEvents(): void {
    const events = this.props.events;
    if (!events || !this.domElement) {
      return;
    }

    for (const eventName in events) {
      const callback = events[eventName];
      if (callback) {
        // spike for using outdated blur instead of focusout
        const capture = eventName === 'blur';

        this.domElement.addEventListener(eventName, callback, capture);
      }
    }
  }

  private removeEvents(): void {
    const events = this.props.events;
    if (!events || !this.domElement) {
      return;
    }

    for (const eventName in events) {
      const callback = events[eventName];
      if (callback) {
        this.domElement.removeEventListener(eventName, callback);
      }
    }
  }

  protected render(): void {
    this.unmountComponent();
    const fragment = this.compile();
    if (this.domElement && fragment) {
      this.domElement.replaceWith(fragment);
    }
    this.domElement = fragment;
    this.mountComponent();
  }

  private compile(): Element | null {
    const html = Handlebars.compile(this.template)(this.props);
    const templateElement = document.createElement('template');
    templateElement.innerHTML = html;
    const fragment = templateElement.content;

    if (this.props.__children) {
      this.children = this.props.__children.map((child) => child.component);

      this.props.__children.forEach((child) => {
        child.embed(fragment);
      });
    }

    const defaultRefs = this.props?.__refs ?? {};
    this.refs = Array.from(fragment.querySelectorAll('[ref]')).reduce(
      (list, element) => {
        const key = element.getAttribute('ref') as string;
        list[key] = element as HTMLElement;
        element.removeAttribute('ref');
        return list;
      },
      defaultRefs,
    );

    return templateElement.content.firstElementChild;
  }
}
