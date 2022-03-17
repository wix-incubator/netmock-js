const netmock = require('./src/classes/netmock');
const { InterceptionHandler } = require('./src/types/interceptor');
const {
  Method,
  NetmockRequest,
  NetmockResponse,
  NetmockResponseParams,
} = require('./src/types/base');

module.exports = netmock;

Object.assign(module.exports, {
  InterceptionHandler,
  Method,
  NetmockRequest,
  NetmockResponse,
  NetmockResponseParams,
});
