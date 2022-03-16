import { NetmockResponse } from '../classes/netmock-response';

import { NetmockRequest } from './base';

export type InterceptionHandler<T = any> = (req: NetmockRequest, res: NetmockResponse<T>) => T;

export interface Interceptor<T = any> {
  key: string,
  res: NetmockResponse<T>,
  handler?: InterceptionHandler<T>,
  paramsNames: string[],
}
