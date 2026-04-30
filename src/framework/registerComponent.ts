import Handlebars, { HelperOptions } from 'handlebars';
import { Block } from './Block';

let uniqueId = 0;

interface ComponentClass {
  componentName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (props: any): Block;
}

export function registerComponent(Component: ComponentClass): void {
  const dataAttribute = `data-component-hbs-id="${++uniqueId}"`;

  Handlebars.registerHelper(
    Component.componentName,
    function (this: unknown, { hash, data }: HelperOptions) {
      const component = new Component(hash);

      if ('ref' in hash) {
        (data.root.__refs = data.root.__refs || {})[hash.ref] = component.element();
      }

      (data.root.__children = data.root.__children || []).push({
        component,
        embed(node: DocumentFragment) {
          const placeholder = node.querySelector(`[${dataAttribute}]`);
          if (!placeholder) {
            throw new Error(`Can't find data-id for component ${Component.componentName}`);
          }

          const element = component.element();
          if (!element) {
            throw new Error('Component element is not created');
          }

          placeholder.replaceWith(element);
        },
      });

      return `<div ${dataAttribute}></div>`;
    },
  );
}
