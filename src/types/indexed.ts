export type Indexed<T = unknown> = {
  [key in string]: T;
};
