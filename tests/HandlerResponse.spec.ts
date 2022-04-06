describe('Response', () => {
  let netmock: typeof import('../src').netmock;
  let reply: typeof import('../src').reply;
  beforeEach(() => {
    netmock = require('netmock-js').netmock;
    reply = require('netmock-js').reply;
  });

  it('should throw an error if someone forgot to return the reply object', async () => {
    netmock.get('https://wix.com', () => {
      reply('Mocked Text');
    });
    await expect(() => fetch('https://wix.com')).rejects.toThrow('Error: detected unreturned reply. Did you used "reply()" instead of "return reply()"?');
  });

  it('should support async handler', async () => {
    netmock.get('https://wix.com', async () => reply('Mocked Text'));
    netmock.get('https://blamos.com', async () => 'another mocked text');

    expect(await (await fetch('https://wix.com')).text()).toBe('Mocked Text');
    expect(await (await fetch('https://blamos.com')).text()).toBe('another mocked text');
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
      netmock.get('https://wix.com', () => reply('Mocked Text').delay(100));
      let value;
      fetch('https://wix.com').then(async (res) => {
        value = await res.text();
      });
      await new Promise((r) => { setTimeout(r, 50); });
      expect(value).toEqual(undefined);
      await new Promise((r) => { setTimeout(r, 60); });
      expect(value).toEqual('Mocked Text');
    });
    it('should allow setting all of the response params at once', async () => {
      netmock.get('https://wix.com', () => reply('Mocked Text').set({
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
      netmock.get('https://wix.com', () => reply('Mocked Text').statusCode(400));
      const res = await fetch('https://wix.com');
      expect(res.status).toEqual(400);
    });

    it('should mock response headers', async () => {
      netmock.get('https://wix.com', () => reply('Mocked Text').headers({ accept: 'text/html' }));

      const res = await fetch('https://wix.com');
      const headers = Object.fromEntries(res.headers);
      expect(headers).toEqual(expect.objectContaining({ accept: 'text/html' }));
    });
  });
});
