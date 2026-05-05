/* eslint-disable @typescript-eslint/no-explicit-any */
import { Block } from './Block';
import store from './Store';
import { isEqual } from '../utils/isEqual';
import type { Indexed } from '../types/indexed';
import type { PlainObject } from '../utils/typeChecks';

type MapStateToProps = (state: Indexed) => Indexed;
type AnyComponentClass = new (props: any) => Block<any>;

export function connect(mapStateToProps: MapStateToProps) {
  return function <T extends AnyComponentClass>(Component: T): T {
    const Base = Component as unknown as new (props: any) => any;
    class Connected extends Base {
      private __unsubscribe?: () => void;
      private __mappedState: Indexed;

      constructor(props: any) {
        const initialState = mapStateToProps(store.getState());
        super({ ...props, ...initialState });
        this.__mappedState = initialState;
      }

      protected componentDidMount(): void {
        this.__unsubscribe = store.subscribe(() => {
          const newState = mapStateToProps(store.getState());

          if (
            !isEqual(this.__mappedState as PlainObject, newState as PlainObject)
          ) {
            this.__mappedState = newState;
            this.setProps({ ...newState });
          }
        });

        super.componentDidMount();
      }

      protected componentWillUnmount(): void {
        this.__unsubscribe?.();
        this.__unsubscribe = undefined;
        super.componentWillUnmount();
      }
    }

    return Connected as unknown as T;
  };
}
