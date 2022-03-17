const {
  Method,
  NetmockRequest,
  NetmockResponse,
} = require('./src/types/base');
const netmock = require('./src/classes/netmock');

module.exports = netmock;

Object.assign(module.exports, {
  Method,
  NetmockRequest,
  NetmockResponse,
});
