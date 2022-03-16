import { NetmockRequest, NetmockResponse } from './base';

export type InterceptionHandler = (req: NetmockRequest, res: NetmockResponse) => any;

export interface Interceptor {
  key: string,
  handler: InterceptionHandler,
  paramsNames: string[],
}
