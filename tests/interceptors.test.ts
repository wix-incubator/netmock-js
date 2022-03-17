import { Netmock } from '../src/types/netmock';

describe('Interceptors Tests', () => {
  let netmock: Netmock;

  beforeEach(() => {
    netmock = require('..').default;
  });

  describe('Interceptors Handler Functions Tests', () => {
    describe('Response Params', () => {
      describe('Response Body', () => {
        it('should mock a string response body', async () => {
          netmock.mock.get('https://wix.com', () => 'Mocked Text');

          const res = await fetch('https://wix.com');
          const body = await res.text();

          expect(body).toBe('Mocked Text');
        });

        it('should mock a number response body', async () => {
          netmock.mock.get('https://wix.com', () => 5);

          const res = await fetch('https://wix.com');
          const body = await res.text();

          expect(body).toBe('5');
        });

        it('should mock a json response body', async () => {
          netmock.mock.get('https://wix.com', () => ({ mocked: true }));

          const res = await fetch('https://wix.com');
          const body = await res.json();

          expect(body).toEqual({ mocked: true });
        });
      });

      describe('Other Params', () => {
        it('should mock default response status code 200', async () => {
          netmock.mock.get('https://wix.com', () => 'Mocked Text');

          const res = await fetch('https://wix.com');

          expect(res.status).toEqual(200);
        });

        it('should mock response status code with handler', async () => {
          netmock.mock.get('https://wix.com', (_, res) => {
            res.status = 400;
            return 'Mocked Text';
          });

          const res = await fetch('https://wix.com');

          expect(res.status).toEqual(400);
        });

        it('should mock response status code with reply', async () => {
          netmock.mock.get('https://wix.com').reply('Mocked Text').params({ status: 400 });

          const res = await fetch('https://wix.com');

          expect(res.status).toEqual(400);
        });

        it('should mock default response params with reply', async () => {
          netmock.mock.get('https://wix.com').reply('Mocked Text').statusCode(400);
          netmock.mock.get('https://wix.com').reply('Mocked Text').params();

          const res = await fetch('https://wix.com');

          expect(res.status).toEqual(200);
        });

        it('should mock response headers', async () => {
          netmock.mock.get('https://wix.com', (_, res) => {
            res.headers = { accept: 'text/html' };
            return 'Mocked Text';
          });

          const res = await fetch('https://wix.com');

          const headers = Object.fromEntries(res.headers); // ?

          expect(headers).toEqual(expect.objectContaining({ accept: 'text/html' }));
        });
      });
    });

    describe('Request Params', () => {
      describe('URL Params', () => {
        it('should mock a request url with params', async () => {
          netmock.mock.get('https://wix.com/:id', (req) => {
            if (req.params.id === '5') {
              return 'Bingo!';
            }
            return 'No luck...';
          });

          const resBingo = await fetch('https://wix.com/5');
          const bodyBingo = await resBingo.text();

          const resRegular = await fetch('https://wix.com/3');
          const bodyRegular = await resRegular.text();

          expect(bodyBingo).toBe('Bingo!');
          expect(bodyRegular).toBe('No luck...');
        });

        it('should mock a request url with one param in the middle', async () => {
          netmock.mock.get('https://wix.com/user/:id/photo', (req) => {
            if (req.params.id === '5') {
              return 'Bingo!';
            }
            return 'No luck...';
          });

          const res = await fetch('https://wix.com/user/5/photo');
          const body = await res.text();

          expect(body).toBe('Bingo!');
        });

        it('should mock a request url with two params', async () => {
          netmock.mock.get('https://wix.com/:id/:name', (req) => {
            if (req.params.id === '5' && req.params.name === 'Peter Parker') {
              return 'Bingo!';
            }
            return 'No luck...';
          });

          const res = await fetch('https://wix.com/5/Peter Parker');
          const body = await res.text();

          expect(body).toBe('Bingo!');
        });

        it('should mock a request url with three params', async () => {
          netmock.mock.get('https://wix.com/:id/:name/photo/:city', (req) => {
            if (
              req.params.id === '5'
            && req.params.name === 'Peter Parker'
            && req.params.city === 'New York'
            ) {
              return 'Bingo!';
            }
            return 'No luck...';
          });

          const res = await fetch('https://wix.com/5/Peter Parker/photo/New York');
          const body = await res.text();

          expect(body).toBe('Bingo!');
        });
      });

      describe('Query Params', () => {
        it('should mock a request with query', async () => {
          netmock.mock.get('https://wix.com', (req) => {
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
          netmock.mock.get('https://wix.com', (req) => {
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

  describe('Interceptors Match Tests', () => {
    describe('Interceptor Match', () => {
      it('should match an explicit url', async () => {
        netmock.mock.get('https://wix.com/exact/route/to/match', () => 'Mocked Text');

        const resHit = await fetch('https://wix.com/exact/route/to/match');
        const resMiss = () => fetch('https://wix.com/exact/route/match');

        expect(resHit).toBeDefined();
        await expect(resMiss).rejects.toThrow('Endpoint not mocked');
      });

      it('should match a RegExp', async () => {
        const re = /regexp[/].+$/; // Include 'regexp' but not at the end
        netmock.mock.get(re, () => 'Mocked Text');

        const resHit = await fetch('https://wix.com/route/with/regexp/match');
        const resMiss = () => fetch('https://wix.com/regular/route/');

        expect(resHit).toBeDefined();
        await expect(resMiss).rejects.toThrow('Endpoint not mocked');
      });

      it('should match a dynamic url', async () => {
        netmock.mock.get('https://wix.com/dynamic/route/:id/match', () => 'Mocked Text');

        const resHit = await fetch('https://wix.com/dynamic/route/1024/match');
        const resMiss = () => fetch('https://wix.com/dynamic/route/1024');

        expect(resHit).toBeDefined();
        await expect(resMiss).rejects.toThrow('Endpoint not mocked');
      });

      describe('Interceptor Hierarchy', () => {
        it('should override an interceptor if mocked the same url twice', async () => {
          netmock.mock.get('https://wix.com', () => 'Mocked Text');
          netmock.mock.get('https://wix.com', () => 'Text Override');

          const res = await fetch('https://wix.com');
          const body = await res.text();

          expect(body).toBe('Text Override');
        });

        it('should intercept a direct mock over regexp and dynamic', async () => {
          netmock.mock.get('https://wix.com/exact/route/to/match', () => 'Exact Match');
          netmock.mock.get(/exact/, () => 'RegExp Match');
          netmock.mock.get('https://wix.com/:dynamic/route/to/match', () => 'Dynamic Match');

          const res = await fetch('https://wix.com/exact/route/to/match');
          const body = await res.text();

          expect(body).toBe('Exact Match');
        });

        it('should intercept a regexp mock over dynamic', async () => {
          netmock.mock.get(/regexp/, () => 'RegExp Match');
          netmock.mock.get('https://wix.com/:dynamic/but/to/regexp', () => 'Dynamic Match');

          const res = await fetch('https://wix.com/123/but/to/regexp');
          const body = await res.text();

          expect(body).toBe('RegExp Match');
        });
      });
    });
  });

  describe('Interceptors Network Methods Tests', () => {
    it('should intercept a post request', async () => {
      netmock.mock.post('https://wix.com', () => 'Mocked Text');

      const res = await fetch('https://wix.com', { method: 'POST' });
      const body = await res.text();

      expect(body).toBe('Mocked Text');
    });

    it('should intercept a put request', async () => {
      netmock.mock.put('https://wix.com', () => 'Mocked Text');

      const res = await fetch('https://wix.com', { method: 'PUT' });
      const body = await res.text();

      expect(body).toBe('Mocked Text');
    });

    it('should intercept a patch request', async () => {
      netmock.mock.patch('https://wix.com', () => 'Mocked Text');

      const res = await fetch('https://wix.com', { method: 'PATCH' });
      const body = await res.text();

      expect(body).toBe('Mocked Text');
    });

    it('should intercept a delete request', async () => {
      netmock.mock.delete('https://wix.com', () => 'Mocked Text');

      const res = await fetch('https://wix.com', { method: 'DELETE' });
      const body = await res.text();

      expect(body).toBe('Mocked Text');
    });

    it('should intercept a post request but not a get request tto the same route', async () => {
      netmock.mock.post('https://wix.com', () => 'Mocked Text');

      const resHit = await fetch('https://wix.com', { method: 'POST' });
      const resMiss = () => fetch('https://wix.com');
      const bodyHit = await resHit.text();

      expect(bodyHit).toBe('Mocked Text');
      await expect(resMiss).rejects.toThrow('Endpoint not mocked GET');
    });
  });
});
