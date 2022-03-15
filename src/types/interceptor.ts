import { NetmockRequest } from './base';

export type InterceptionHandler = (req: NetmockRequest) => any;

export interface Interceptor {
  key: string,
  handler: InterceptionHandler,
  paramsNames: string[],
}
