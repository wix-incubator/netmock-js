(global as any).originalFetch = jest.fn();
jest.mock('node-fetch', () => {
  const realNodeFetch = jest.requireActual('node-fetch');
  const result = jest.fn(() => ({ ok: true }));
  (global as any).fetchSpy = result;
  Object.assign(result, realNodeFetch);
  return result;
});

beforeEach(() => {
  (global as any).fetchSpy.mockClear();
});
require('./src/jest-setup');
