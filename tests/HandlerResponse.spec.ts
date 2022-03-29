import { resp } from '../src/NetmockResponse';

describe('Response', () => {
  let netmock: typeof import('../src').netmock;

  beforeEach(() => {
    netmock = require('../src').netmock;
  });

  describe('Response Body', () => {
    it('should mock a string response body', async () => {
      netmock.get('https://wix.com', () => 'Mocked Text');
      const res = await fetch('https://wix.com');
      const body = await res.text();

      expect(body).toBe('Mocked Text');
    });

    it('should mock a number response body', async () => {
      netmock.get('https://wix.com', () => 5);

      const res = await fetch('https://wix.com');
      const body = await res.text();

      expect(body).toBe('5');
    });

    it('should mock a json response body', async () => {
      netmock.get('https://wix.com', () => ({ mocked: true }));

      const res = await fetch('https://wix.com');
      const body = await res.json();

      expect(body).toEqual({ mocked: true });
    });
  });

  describe('Other Params', () => {
    it('should allow setting a delay', async () => {
      netmock.get('https://wix.com', () => resp('Mocked Text').delay(100));
      let value;
      fetch('https://wix.com').then(async (res) => {
        value = await res.text();
      });
      await new Promise((r) => { setTimeout(r, 50); });
      expect(value).toEqual(undefined);
      await new Promise((r) => { setTimeout(r, 50); });
      expect(value).toEqual('Mocked Text');
    });
    it('should allow setting all of the response params at once', async () => {
      netmock.get('https://wix.com', () => resp('Mocked Text').set({
        status: 400,
        headers: { accept: 'text/html' },
        body: 'niryo',
        statusText: 'wow',
      }));
      const res = await fetch('https://wix.com');
      expect(res.status).toEqual(400);
      expect(res.statusText).toEqual('wow');
      expect(await res.text()).toEqual('niryo');
      const headers = Object.fromEntries(res.headers);
      expect(headers).toEqual(expect.objectContaining({ accept: 'text/html' }));
    });
    it('should mock default response status code 200', async () => {
      netmock.get('https://wix.com', () => 'Mocked Text');

      const res = await fetch('https://wix.com');

      expect(res.status).toEqual(200);
    });

    it('should mock response status code with handler', async () => {
      netmock.get('https://wix.com', () => resp('Mocked Text').statusCode(400));
      const res = await fetch('https://wix.com');
      expect(res.status).toEqual(400);
    });

    it('should mock response headers', async () => {
      netmock.get('https://wix.com', () => resp('Mocked Text').headers({ accept: 'text/html' }));

      const res = await fetch('https://wix.com');
      const headers = Object.fromEntries(res.headers);
      expect(headers).toEqual(expect.objectContaining({ accept: 'text/html' }));
    });
  });
});
