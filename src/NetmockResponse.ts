import type {
  NetmockResponseFields, NetmockResponseParams, Headers, NetmockResponseType,
} from './types';

/**
 * The netmock response class provides an api to get, set and parse
 * response body and parameters.
 */
export class NetmockResponse<T> implements NetmockResponseType<T> {
  private params: NetmockResponseFields = {
    body: undefined,
    status: 200,
    delay: 0,
  };

  constructor(body?: T) {
    this.params.body = body;
  }

  /**
   * @param {number} delay Specify response delay, in order to simulate slow network and delayed responses
   * @return {Response} This response instance for chaining purposes.
   */
  delay(value: number) {
    this.params.delay = value;
    return this;
  }

  /**
   * Set the response status code parameter.
   * @param {number} statusCode The new response status code.
   * @return {Response} This response instance for chaining purposes.
   */
  statusCode(statusCode: number) {
    this.params.status = statusCode;
    return this;
  }

  /**
   * Set the response headers
   * @param {Headers} headers The new response params.
   * @return {Response} This response instance for chaining purposes.
   */
  headers(headers: Headers) {
    this.params.headers = headers;
    return this;
  }

  /**
   * A convenient function for Setting multiple response params at once
   * @param {Partial<NetmockResponseParams>} params The response params.
   * @return {Response} This response instance for chaining purposes.
 */
  set(params: Partial<NetmockResponseFields> = {}) {
    Object.assign(this.params, params);
    return this;
  }

  /**
   * Get stringify request body.
   * @return {string} The request body as string
   */
  stringifyBody(): string {
    return typeof this.params.body === 'string'
      ? this.params.body
      : JSON.stringify(this.params.body);
  }

  /**
   * Return the response parameters
   * @return {NetmockResponseParams} The response parameters.
   */
  getResponseParams(): NetmockResponseParams {
    return { ...this.params };
  }
}

/**
 * Create Netmock response. You can use it to return a response from your mocked endpoint's handler, in
 * cases when you need to tweak the response params (headers, statusCode etc`...)
 * @param body the response body
 * @return {Response} This response instance for chaining purposes.
 */
export function resp<T>(body?: T) {
  return new NetmockResponse<T>(body);
}
