import { resp } from '../src/NetmockResponse';
import { Method } from '../src/types';

describe('Netmock', () => {
  let netmock: typeof import('../src').netmock;

  beforeEach(() => {
    netmock = require('../src').netmock;
  });
  describe('Settings', () => {
    it('should throw an exception if network is disabled and an unmocked request is fetched', async () => {
      require('../src').allowRealNetwork(false);
      await expect(fetchData()).rejects.toThrow('Endpoint not mocked');
    });

    it('should make a real network call if network is enabled and an unmocked request is fetched', async () => {
      require('../src').allowRealNetwork(true);
      await fetchData();
      await expect((global as any).fetchSpy).toHaveBeenCalledWith('https://wix.com', undefined);
    });
  });

  it('should work with implicit get request (calling fetch without method parameter)', async () => {
    netmock.get('https://wix.com', () => 'Mocked Text');
    const res = await fetch('https://wix.com');
    const body = await res.text();
    expect(body).toBe('Mocked Text');
  });
  it('should work with explicit method as option', async () => {
    function mockUrl(url: string, method: Method) {
      netmock[method](url, () => method);
    }
    async function testUrl(url: string, method: Method) {
      const res = await fetch(url, { method });
      const body = await res.text();
      expect(body).toBe(method);
    }
    mockUrl('https://a.com', 'get');
    mockUrl('https://b.com', 'post');
    mockUrl('https://c.com', 'put');
    mockUrl('https://d.com', 'patch');
    mockUrl('https://e.com', 'delete');

    await testUrl('https://a.com', 'get');
    await testUrl('https://b.com', 'post');
    await testUrl('https://c.com', 'put');
    await testUrl('https://d.com', 'patch');
    await testUrl('https://e.com', 'delete');
  });

  describe('mockedEndpoint Handler Functions Tests', () => {
    describe('Response Params', () => {
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
          const headers = Object.fromEntries(res.headers); // ?
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
          const headers = Object.fromEntries(res.headers); // ?
          expect(headers).toEqual(expect.objectContaining({ accept: 'text/html' }));
        });
      });
    });

    describe('Request Params', () => {
      describe('URL Params', () => {
        it('should mock a request url with params', async () => {
          netmock.get('https://wix.com/:id', (req) => req.params.id);

          const res1 = await fetch('https://wix.com/5');
          expect(await res1.text()).toBe('5');

          const res2 = await fetch('https://wix.com/3');
          expect(await res2.text()).toBe('3');
        });

        it('should mock a request url with one param in the middle', async () => {
          netmock.get('https://wix.com/user/:id/photo', (req) => {
            expect(req.params.id).toEqual('5');
          });

          await fetch('https://wix.com/user/5/photo');
        });

        it('should mock a request url with two params', async () => {
          netmock.get('https://wix.com/:id/:name', (req) => {
            expect(req.params).toEqual({ id: '5', name: 'Peter Parker' });
          });

          await fetch('https://wix.com/5/Peter Parker');
        });

        it('should mock a request url with three params', async () => {
          netmock.get('https://wix.com/:id/:name/photo/:city', (req) => {
            expect(req.params).toEqual({
              city: 'New York',
              id: '5',
              name: 'Peter Parker',
            });
          });

          await fetch('https://wix.com/5/Peter Parker/photo/New York');
        });
      });

      describe('Query Params', () => {
        it('should mock a request with query', async () => {
          netmock.get('https://wix.com', (req) => {
            if (req.query.mock) {
              return 'Im a mock!';
            }
            return 'Im a regular response';
          });

          const resHit = await fetch('https://wix.com?mock=true');
          const bodyHit = await resHit.text();

          const resMiss = await fetch('https://wix.com');
          const bodyMiss = await resMiss.text();

          expect(bodyHit).toBe('Im a mock!');
          expect(bodyMiss).toBe('Im a regular response');
        });

        it('should use a request query in response', async () => {
          netmock.get('https://wix.com', (req) => {
            if (Object.keys(req.query).length > 0) {
              return req.query;
            }
            return null;
          });

          const res = await fetch('https://wix.com?firstName=Scarlet&lastName=Johansson');
          const body = await res.json();

          expect(body).toEqual({ firstName: 'Scarlet', lastName: 'Johansson' });
        });
      });
    });
  });

  describe('Mocked Endpoints Match Tests', () => {
    describe('Mocked endpoints Match', () => {
      it('should match an explicit url', async () => {
        netmock.get('https://wix.com/exact/route/to/match', () => 'Mocked Text');

        const resHit = await fetch('https://wix.com/exact/route/to/match');
        const resMiss = () => fetch('https://wix.com/exact/route/match');

        expect(resHit).toBeDefined();
        await expect(resMiss).rejects.toThrow('Endpoint not mocked');
      });

      it('should match a RegExp', async () => {
        const re = /regexp[/].+$/; // Include 'regexp' but not at the end
        netmock.get(re, () => 'Mocked Text');

        const resHit = await fetch('https://wix.com/route/with/regexp/match');
        const resMiss = () => fetch('https://wix.com/regular/route/');

        expect(resHit).toBeDefined();
        await expect(resMiss).rejects.toThrow('Endpoint not mocked');
      });

      it('should match a dynamic url', async () => {
        netmock.get('https://wix.com/dynamic/route/:id/match', () => 'Mocked Text');

        const resHit = await fetch('https://wix.com/dynamic/route/1024/match');
        const resMiss = () => fetch('https://wix.com/dynamic/route/1024');

        expect(resHit).toBeDefined();
        await expect(resMiss).rejects.toThrow('Endpoint not mocked');
      });

      describe('Mocked Endpoint Hierarchy', () => {
        it('should override a mocked endpoint if mocked the same url twice', async () => {
          netmock.get('https://wix.com', () => 'Mocked Text');
          netmock.get('https://wix.com', () => 'Text Override');

          const res = await fetch('https://wix.com');
          const body = await res.text();

          expect(body).toBe('Text Override');
        });

        it('should intercept a direct mock over regexp and dynamic', async () => {
          netmock.get('https://wix.com/exact/route/to/match', () => 'Exact Match');
          netmock.get(/exact/, () => 'RegExp Match');
          netmock.get('https://wix.com/:dynamic/route/to/match', () => 'Dynamic Match');

          const res = await fetch('https://wix.com/exact/route/to/match');
          const body = await res.text();

          expect(body).toBe('Exact Match');
        });

        it('should intercept a regexp mock over dynamic', async () => {
          netmock.get(/regexp/, () => 'RegExp Match');
          netmock.get('https://wix.com/:dynamic/but/to/regexp', () => 'Dynamic Match');

          const res = await fetch('https://wix.com/123/but/to/regexp');
          const body = await res.text();

          expect(body).toBe('RegExp Match');
        });
      });
    });
  });

  describe('Mocked Endpoints Network Methods Tests', () => {
    it('should intercept a post request', async () => {
      netmock.post('https://wix.com', () => 'Mocked Text');

      const res = await fetch('https://wix.com', { method: 'POST' });
      const body = await res.text();

      expect(body).toBe('Mocked Text');
    });

    it('should intercept a put request', async () => {
      netmock.put('https://wix.com', () => 'Mocked Text');

      const res = await fetch('https://wix.com', { method: 'PUT' });
      const body = await res.text();

      expect(body).toBe('Mocked Text');
    });

    it('should intercept a patch request', async () => {
      netmock.patch('https://wix.com', () => 'Mocked Text');

      const res = await fetch('https://wix.com', { method: 'PATCH' });
      const body = await res.text();
      expect(body).toBe('Mocked Text');
    });

    it('should intercept a delete request', async () => {
      netmock.delete('https://wix.com', () => 'Mocked Text');

      const res = await fetch('https://wix.com', { method: 'DELETE' });
      const body = await res.text();

      expect(body).toBe('Mocked Text');
    });

    it('should intercept a post request but not a get request to the same route', async () => {
      netmock.post('https://wix.com', () => 'Mocked Text');

      const resHit = await fetch('https://wix.com', { method: 'POST' });
      const resMiss = () => fetch('https://wix.com');
      const bodyHit = await resHit.text();

      expect(bodyHit).toBe('Mocked Text');
      await expect(resMiss).rejects.toThrow('Endpoint not mocked: GET https://wix.com');
    });
  });
});

async function fetchData() {
  return fetch('https://wix.com');
}
