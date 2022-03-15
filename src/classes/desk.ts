import { InterceptorsDictionary } from '../types/desk';
import { InterceptionHandler } from '../types/interceptor';
import { getKeyFromInput, getParamsNamesFromInput } from '../utils/parse';
import { overrideFetch, restoreFetchOverride } from '../utils/override';
import { Singleton } from '../utils/singleton';

export class Desk {
  interceptors: InterceptorsDictionary = { get: {}, post: {} };

  /**
   * The Desk class provides an api to register interceptors to mock network calls
   * to specific routes.
   * Interceptor provides a URL, method and handler function, that will be called when
   * the URL is requested by the Fetch API fetch() function.
   * The interceptor's handler return value is the response for the request.
   */
  constructor() {
    overrideFetch(this.interceptors);
  }

  /**
   * Register a get interceptor.
   * @param {string} url The interceptor's URL.
   * @param {InterceptionHandler} handler An interceptor handler function.
   */
  get(url: string, handler: InterceptionHandler) {
    const key = getKeyFromInput(url);
    const paramsNames = getParamsNamesFromInput(url);
    this.interceptors.get[key] = { key, handler, paramsNames };
  }

  /**
   * Register a post interceptor.
   * @param {string} url The interceptor's URL.
   * @param {InterceptionHandler} handler An interceptor handler function.
   */
  post(url: string, handler: InterceptionHandler) {
    const key = getKeyFromInput(url);
    const paramsNames = getParamsNamesFromInput(url);
    this.interceptors.post[key] = { key, handler, paramsNames };
  }

  /**
   * Clean the desk.
   * Clear the interceptor's dictionary.
   */
  cleanup() {
    this.interceptors = { get: {}, post: {} };
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

const DeskSingleton = Singleton(() => new Desk());
export const desk = () => DeskSingleton.getInstance();
