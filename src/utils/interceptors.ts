import { Method } from '../types/base';
import { InterceptorsDictionary } from '../types/desk';
import { getKeyFromInput } from './parse';

/**
 * Find the best interceptor to intercept the endpoint.
 * @param interceptors
 * @param params
 * @return {InterceptionHandler} The handler function of the best interceptor.
 * @throws {ReferenceError} Network is disabled anf no interceptor found.
 */
export function findInterceptor(
  interceptors: InterceptorsDictionary,
  params: { input: RequestInfo, method: Method },
) {
  const { input, method } = params;
  const key = getKeyFromInput(input);

  const interceptor = interceptors[method][key];

  if (!interceptor) {
    const message = `Endpoint not mocked ${method.toUpperCase()} ${key}`;
    throw ReferenceError(message); // TODO: check if network is disabled
  }

  return interceptor;
}
