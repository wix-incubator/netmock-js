import { NetmockRequest, NetmockResponse } from './base';

export type InterceptionHandler<T = any> = (req: NetmockRequest, res: NetmockResponse) => T;

export interface Interceptor {
  key: string,
  handler: InterceptionHandler,
  paramsNames: string[],
}
