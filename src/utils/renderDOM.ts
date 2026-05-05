import { Block } from '../framework/Block';

export function render(query: string, block: Block): Element | null {
  const root = document.querySelector(query);
  if (!root) {
    return null;
  }
  const content = block.element();
  if (content) {
    root.innerHTML = '';
    root.appendChild(content);
  }
  return root;
}
