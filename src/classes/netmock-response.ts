import { NetmockResponse as TNetmockResponse } from '../types/base';

type NetmockResponseParams = Omit<TNetmockResponse, 'body'>;

/**
 * The netmock response class provides an api to get, set and parse
 * response body and parameters.
 */
export class NetmockResponse<T> implements TNetmockResponse<T> {
  body: T | null;
  status: number;
  delay: number;
  statusText?: string;
  headers?: { [key: string]: string };

  constructor() {
    this.body = null;
    this.status = 200;
    this.delay = 0;
  }

  /**
   * Set the response body.
   * @param {<T>>T | null} body The response body.
   * @return {Response} This response instance.
   */
  reply(body: T | null) {
    this.body = body;
    return this;
  }

  /**
   * Set the response status code parameter.
   * @param {number} statusCode The new response status code.
   * @return {Response} This response instance.
   */
  statusCode(statusCode: number) {
    this.status = statusCode;
    return this;
  }

  /**
   * Set the response parameters.
   * @param {Partial<NetmockResponseParams>} params The new response params.
   * @return {Response} This response instance.
   */
  params(params: Partial<NetmockResponseParams> = {}) {
    this.delay = params.delay ?? this.delay;
    this.headers = params.headers ?? this.headers;
    this.statusText = params.statusText ?? this.statusText;
    this.status = params.status ?? this.status;
    return this;
  }

  /**
   * Stringify the request body.
   * @return {string} The request body as string
   */
  stringifyBody(): string {
    return typeof this.body === 'string'
      ? this.body
      : JSON.stringify(this.body);
  }

  /**
   * Return the response parameters
   * @return {NetmockResponseParams} The response parameters.
   */
  getResponseParams(): NetmockResponseParams {
    return {
      delay: this.delay,
      headers: this.headers,
      status: this.status,
      statusText: this.statusText,
    };
  }
}
