import { InterceptorsDictionary } from '../types/desk';
import { InterceptionHandler } from '../types/interceptor';
import { Method } from '../types/base';
import { extractKeyFromInput, extractParamsNamesFromInput } from '../utils/extract';
import { overrideFetch, restoreFetchOverride } from '../utils/override';

import { NetmockResponse } from './netmock-response';
import { singletonize } from '../utils/singleton';

/**
 * The Desk class provides an api to register interceptors to mock network calls
 * to specific routes.
 * Interceptor provides a URL, method and handler function, that will be called when
 * the url is requested by the Fetch API fetch() function.
 * The interceptor's handler return value is the response for the request.
 */
export class Desk {
  interceptors: InterceptorsDictionary = {
    get: {}, post: {}, put: {}, patch: {}, delete: {},
  };

  constructor() {
    overrideFetch(this.interceptors);
  }

  /**
   * Register an interceptor to its correspondence method key.
   * @param {Method} method The request method
   * @param {string | RegExp} url The request url.
   * @param {InterceptionHandler} handler The interceptor handler function (optional)
   * @return {NetmockResponse} The interceptor NetmockResponse instance.
   * @private
   */
  private register(method: Method, url: string | RegExp, handler?: InterceptionHandler) {
    const key = extractKeyFromInput(url);
    const paramsNames = extractParamsNamesFromInput(url);

    const res = new NetmockResponse();
    if (!handler) {
      this.interceptors[method][key] = { key, res, paramsNames };
      return res;
    }
    this.interceptors[method][key] = {
      key, handler, res, paramsNames,
    };

    return res;
  }

  /**
   * Register a get interceptor.
   * @param {string | RegExp} url The request url.
   * @param {InterceptionHandler} handler The interceptor handler function (optional)
   * @return {NetmockResponse} The interceptor NetmockResponse instance;
   */
  get(url: string | RegExp, handler?: InterceptionHandler) {
    return this.register(Method.get, url, handler);
  }

  /**
   * Register a post interceptor.
   * @param {string | RegExp} url The request url.
   * @param {InterceptionHandler} handler The interceptor handler function (optional)
   * @return {NetmockResponse} The interceptor NetmockResponse instance;
   */
  post(url: string | RegExp, handler?: InterceptionHandler) {
    return this.register(Method.post, url, handler);
  }

  /**
   * Register a post interceptor.
   * @param {string | RegExp} url The request url.
   * @param {InterceptionHandler} handler The interceptor handler function (optional)
   * @return {NetmockResponse} The interceptor NetmockResponse instance;
   */
  put(url: string | RegExp, handler?: InterceptionHandler) {
    return this.register(Method.put, url, handler);
  }

  /**
   * Register a post interceptor.
   * @param {string | RegExp} url The request url.
   * @param {InterceptionHandler} handler The interceptor handler function (optional)
   * @return {NetmockResponse} The interceptor NetmockResponse instance;
   */
  patch(url: string | RegExp, handler?: InterceptionHandler) {
    return this.register(Method.patch, url, handler);
  }

  /**
   * Register a post interceptor.
   * @param {string | RegExp} url The request url.
   * @param {InterceptionHandler} handler The interceptor handler function (optional)
   * @return {NetmockResponse} The interceptor NetmockResponse instance;
   */
  delete(url: string | RegExp, handler?: InterceptionHandler) {
    return this.register(Method.delete, url, handler);
  }

  /**
   * Clean the desk.
   * Clear the interceptor's dictionary.
   */
  cleanup() {
    this.interceptors = {
      get: {}, post: {}, put: {}, patch: {}, delete: {},
    };
    overrideFetch(this.interceptors);
  }

  /**
   * Destroy the desk.
   * Clear the interceptor's dictionary.
   * Restore the original overrides.
   */
  destroy() {
    restoreFetchOverride();
  }

  /**
   * Destroy the desk.
   * Clear the interceptor's dictionary.
   * Restore the original overrides.
   */
  init() {
    this.cleanup();
  }
}

const DeskSingleton = singletonize(() => new Desk());
export const desk = () => DeskSingleton.getInstance();
