(global as any).originalFetch = jest.fn();
jest.mock('node-fetch', () => {
  const realNodeFetch = jest.requireActual('node-fetch');
  const result = jest.fn();
  (global as any).fetchSpy = result;
  Object.assign(result, realNodeFetch);
  return result;
});
require('./src/jest-setup');
