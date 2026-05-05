/* eslint-disable @typescript-eslint/no-explicit-any */
export class BaseAPI {
  public create(..._args: any[]): Promise<any> {
    return Promise.reject(new Error('Not implemented'));
  }

  public request(..._args: any[]): Promise<any> {
    return Promise.reject(new Error('Not implemented'));
  }

  public update(..._args: any[]): Promise<any> {
    return Promise.reject(new Error('Not implemented'));
  }

  public delete(..._args: any[]): Promise<any> {
    return Promise.reject(new Error('Not implemented'));
  }
}
