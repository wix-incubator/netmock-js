describe('Mocked endpoints handler params', () => {
  let netmock: typeof import('../src').netmock;

  beforeEach(() => {
    netmock = require('netmock-js').netmock;
  });

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

    it('should support more than one query params', async () => {
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

  it('should have convenient request headers', async () => {
    netmock.get('https://wix.com', (req) => {
      expect(req.headers).toEqual({ blamos: 'true' });
    });
    const headers = new Headers();
    headers.set('blamos', 'true');
    await fetch('https://wix.com', { headers });
  });

  it('should contain the raw request object', async () => {
    netmock.get('https://wix.com', (req) => {
      expect(req.rawRequest instanceof Request).toEqual(true);
    });
    await fetch('https://wix.com');
  });
});
