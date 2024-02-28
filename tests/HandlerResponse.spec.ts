import axios from 'axios';

describe('Response', () => {
  let netmock: typeof import('../src').netmock;
  let reply: typeof import('../src').reply;

  beforeEach(() => {
    netmock = require('netmock-js').netmock;
    reply = require('netmock-js').reply;
  });

  describe.skip('Detect unreturned replies', () => {
    it('should throw an error if someone forgot to return the reply object', async () => {
      netmock.get('https://wix.com', () => {
        reply('Mocked Text');
      });
      netmock.get('https://wix2.com', async () => {
        await new Promise((r) => setTimeout(r, 0));
        reply('Mocked Text');
      });
      await expect(() => fetch('https://wix.com')).rejects.toThrow('Error: detected unreturned reply. Did you used "reply()" instead of "return reply()"?');
      await expect(() => fetch('https://wix2.com')).rejects.toThrow('Error: detected unreturned reply. Did you used "reply()" instead of "return reply()"?');
    });

    it('should work correctly when there are multiple requests', async () => {
      netmock.get('https://wix.com', () => 'Mocked Text');
      netmock.get('https://wix2.com', () => reply('Mocked Text'));
      fetch('https://wix.com');
      await fetch('https://wix2.com');
    });
  });

  it('should support async handler', async () => {
    netmock.get('https://wix.com', async () => reply('Mocked Text'));
    netmock.get('https://blamos.com', async () => 'another mocked text');

    expect(await (await fetch('https://wix.com')).text()).toBe('Mocked Text');
    expect((await axios.get('https://wix.com')).data).toBe('Mocked Text');
    expect(await (await fetch('https://blamos.com')).text()).toBe('another mocked text');
    expect((await axios.get('https://blamos.com')).data).toBe('another mocked text');
  });
  describe('Response Body', () => {
    it('should mock a string response body', async () => {
      netmock.get('https://wix.com', () => 'Mocked Text');
      expect(await (await fetch('https://wix.com')).text()).toBe('Mocked Text');
      expect((await axios.get('https://wix.com')).data).toBe('Mocked Text');
    });

    it('should mock a number response body', async () => {
      netmock.get('https://wix.com', () => 5);
      expect(await (await fetch('https://wix.com')).text()).toBe('5');
      expect((await axios.get('https://wix.com')).data).toBe(5);
    });

    it('should mock a json response body', async () => {
      netmock.get('https://wix.com', () => ({ mocked: true }));
      netmock.get('https://wix2.com', () => reply({ mocked: true }));
      expect(await (await fetch('https://wix.com')).json()).toEqual({ mocked: true });
      expect(await (await fetch('https://wix2.com')).json()).toEqual({ mocked: true });
      expect((await axios.get('https://wix.com')).data).toEqual({ mocked: true });
    });
  });

  describe('Other Params', () => {
    it('should allow setting a delay', async () => {
      netmock.get('https://wix.com', () => reply('Mocked Text').delay(100));
      let fetchValue;
      let axiosValue;
      fetch('https://wix.com').then(async (res) => {
        fetchValue = await res.text();
      });
      axios.get('https://wix.com').then(async (res) => {
        axiosValue = await res.data;
      });
      await new Promise((r) => { setTimeout(r, 50); });
      expect(fetchValue).toEqual(undefined);
      expect(axiosValue).toEqual(undefined);
      await new Promise((r) => { setTimeout(r, 60); });
      expect(fetchValue).toEqual('Mocked Text');
      expect(axiosValue).toEqual('Mocked Text');
    });

    it('should return different responses based on call count', async () => {
      netmock.get('https://wix.com', (req, data) => reply(`Count ${data.callCount}`));

      const fetchRes1 = await fetch('https://wix.com');
      expect(await fetchRes1.text()).toEqual('Count 0');

      const fetchRes2 = await fetch('https://wix.com');
      expect(await fetchRes2.text()).toEqual('Count 1');
    });

    it('should allow setting all of the response params at once', async () => {
      netmock.get('https://wix.com', () => reply('Mocked Text').set({
        status: 207,
        headers: { accept: 'text/html' },
        body: 'niryo',
        statusText: 'wow',
      }));
      const fetchRes = await fetch('https://wix.com');
      expect(fetchRes.status).toEqual(207);
      expect(fetchRes.statusText).toEqual('wow');
      expect(await fetchRes.text()).toEqual('niryo');
      const headers = Object.fromEntries(fetchRes.headers);
      expect(headers).toEqual(expect.objectContaining({ accept: 'text/html' }));

      const axiosRes = await axios.get('https://wix.com');
      expect(axiosRes.status).toEqual(207);
      expect(axiosRes.statusText).toEqual('wow');
      expect(axiosRes.data).toEqual('niryo');
      expect(axiosRes.headers.accept).toEqual('text/html');
    });
    it('should mock default response status code 200', async () => {
      netmock.get('https://wix.com', () => 'Mocked Text');

      expect(await (await fetch('https://wix.com')).status).toEqual(200);
      expect((await axios.get('https://wix.com')).status).toBe(200);
    });

    it('should mock response status code with handler', async () => {
      netmock.get('https://wix.com', () => reply('Mocked Text').statusCode(207));

      expect(await (await fetch('https://wix.com')).status).toEqual(207);
      expect((await axios.get('https://wix.com')).status).toBe(207);
    });

    it('should mock response headers', async () => {
      netmock.get('https://wix.com', () => reply('Mocked Text').headers({ accept: 'text/html' }));

      const fetchRes = await fetch('https://wix.com');
      const headers = Object.fromEntries(fetchRes.headers);
      expect(headers).toEqual(expect.objectContaining({ accept: 'text/html' }));

      const axiosRes = await axios.get('https://wix.com');
      expect(axiosRes.headers.accept).toEqual('text/html');
    });
  });
});
