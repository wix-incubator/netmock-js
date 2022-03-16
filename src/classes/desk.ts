import { InterceptorsDictionary } from '../types/desk';
import { InterceptionHandler } from '../types/interceptor';
import { extractKeyFromInput, extractParamsNamesFromInput } from '../utils/extract';
import { overrideFetch, restoreFetchOverride } from '../utils/override';
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
   * Register a get interceptor.
   * @param {string | RegExp} url The interceptor's url.
   * @param {InterceptionHandler} handler An interceptor handler function.
   */
  get(url: string | RegExp, handler: InterceptionHandler) {
    const key = extractKeyFromInput(url);
    const paramsNames = extractParamsNamesFromInput(url);
    this.interceptors.get[key] = { key, handler, paramsNames };
  }

  /**
   * Register a post interceptor.
   * @param {string | RegExp} url The interceptor's url.
   * @param {InterceptionHandler} handler An interceptor handler function.
   */
  post(url: string | RegExp, handler: InterceptionHandler) {
    const key = extractKeyFromInput(url);
    const paramsNames = extractParamsNamesFromInput(url);
    this.interceptors.post[key] = { key, handler, paramsNames };
  }

  /**
   * Register a post interceptor.
   * @param {string | RegExp} url The interceptor's url.
   * @param {InterceptionHandler} handler An interceptor handler function.
   */
  put(url: string | RegExp, handler: InterceptionHandler) {
    const key = extractKeyFromInput(url);
    const paramsNames = extractParamsNamesFromInput(url);
    this.interceptors.put[key] = { key, handler, paramsNames };
  }

  /**
   * Register a post interceptor.
   * @param {string | RegExp} url The interceptor's url.
   * @param {InterceptionHandler} handler An interceptor handler function.
   */
  patch(url: string | RegExp, handler: InterceptionHandler) {
    const key = extractKeyFromInput(url);
    const paramsNames = extractParamsNamesFromInput(url);
    this.interceptors.patch[key] = { key, handler, paramsNames };
  }

  /**
   * Register a post interceptor.
   * @param {string | RegExp} url The interceptor's url.
   * @param {InterceptionHandler} handler An interceptor handler function.
   */
  delete(url: string | RegExp, handler: InterceptionHandler) {
    const key = extractKeyFromInput(url);
    const paramsNames = extractParamsNamesFromInput(url);
    this.interceptors.delete[key] = { key, handler, paramsNames };
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
