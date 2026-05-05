import queryString from './queryStringify';
import { PlainObject } from './typeChecks';

const METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

type HTTPMethodName = (typeof METHODS)[keyof typeof METHODS];

export interface RequestOptions {
  headers?: Record<string, string>;
  method?: HTTPMethodName;
  data?: unknown;
  responseType?: XMLHttpRequestResponseType;
  timeout?: number;
}

export interface HTTPError {
  status?: number;
  statusText?: string;
  response?: string;
  reason?: string;
  request: XMLHttpRequest;
}

type HTTPMethod = <R = unknown>(
  url: string,
  options?: RequestOptions,
) => Promise<R>;

class HTTPTransport {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  public get: HTTPMethod = (url, options = {}) =>
    this.request(url, { ...options, method: METHODS.GET }, options.timeout);

  public post: HTTPMethod = (url, options = {}) =>
    this.request(url, { ...options, method: METHODS.POST }, options.timeout);

  public put: HTTPMethod = (url, options = {}) =>
    this.request(url, { ...options, method: METHODS.PUT }, options.timeout);

  public delete: HTTPMethod = (url, options = {}) =>
    this.request(url, { ...options, method: METHODS.DELETE }, options.timeout);

  private request = <R>(
    url: string,
    options: RequestOptions = {},
    timeout = 5000,
  ): Promise<R> => {
    const { headers = {}, method, data, responseType } = options;
    const fullUrl = this.baseUrl + url;

    return new Promise((resolve, reject) => {
      if (!method) {
        reject(new Error('HTTP method is required'));
        return;
      }

      const xhr = new XMLHttpRequest();
      const isGet = method === METHODS.GET;
      const isQueryable =
        data && typeof data === 'object' && !(data instanceof FormData);
      const requestUrl =
        isGet && isQueryable
          ? `${fullUrl}?${queryString(data as PlainObject)}`
          : fullUrl;

      xhr.open(method, requestUrl);
      xhr.withCredentials = true;

      if (responseType) {
        xhr.responseType = responseType;
      }

      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key]);
      });

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          let response: unknown;

          if (xhr.responseType) {
            response = xhr.response;
          } else {
            try {
              const contentType = xhr.getResponseHeader('Content-Type');
              if (contentType && contentType.includes('application/json')) {
                response = JSON.parse(xhr.responseText);
              } else {
                response = xhr.responseText;
              }
            } catch {
              response = xhr.responseText;
            }
          }

          resolve(response as R);
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText,
            request: xhr,
          } as HTTPError);
        }
      };

      xhr.onabort = () =>
        reject({ reason: 'Request aborted', request: xhr } as HTTPError);
      xhr.onerror = () =>
        reject({ reason: 'Network error', request: xhr } as HTTPError);

      xhr.timeout = timeout;
      xhr.ontimeout = () =>
        reject({ reason: 'Request timeout', request: xhr } as HTTPError);

      if (isGet || !data) {
        xhr.send();
      } else if (data instanceof FormData) {
        xhr.send(data);
      } else if (typeof data === 'object') {
        if (!headers['Content-Type']) {
          xhr.setRequestHeader('Content-Type', 'application/json');
        }
        xhr.send(JSON.stringify(data));
      } else {
        xhr.send(data as string);
      }
    });
  };
}

export default HTTPTransport;
