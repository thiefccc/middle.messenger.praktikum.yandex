import type { Indexed } from '../types/indexed';
import merge from '../utils/merge';
import set from '../utils/set';

type Listener = () => void;

export class Store {
  private state: Indexed = {};
  private listeners: Set<Listener> = new Set();

  public getState(): Indexed {
    return this.state;
  }

  public setState(path: string, value: unknown): void {
    const patch = set({}, path, value) as Indexed;
    this.state = merge(this.state, patch);
    this.emit();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export default new Store();
