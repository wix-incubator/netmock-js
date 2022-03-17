import { Netmock } from './src/types/netmock';

declare const netmock: Netmock;
export default netmock;

export { InterceptionHandler } from './src/types/interceptor';
export {
  Method,
  NetmockRequest,
  NetmockResponse,
  NetmockResponseParams,
} from './src/types/base';
