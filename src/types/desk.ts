import { InterceptionHandler } from './interceptor';
import { Method } from './base';

export type InterceptorsDictionary = { [method in keyof typeof Method]: { [key: string]: InterceptionHandler }
};
