describe('Mocked endpoints handler params', () => {
  console.log('first log in describe');
  const axios = require('axios');
  let netmock: typeof import('../src').netmock;

  beforeEach(() => {
    netmock = require('netmock-js').netmock;
  });

  describe.only('URL Params', () => {
    it.only('should mock a request url with params', async () => {
      // netmock.put('https://wix.com/:id', (req) => req.params.id);

      expect(await (await fetch('https://wix.com/5')).text()).toEqual('5');
      expect((await axios.get('https://wix.com/5')).data).toEqual(5);

      // expect(await (await fetch('https://wix.com/3')).text()).toEqual('3');
      // expect((await axios.get('https://wix.com/3')).data).toEqual(3);
    });

    it('should mock a request url with one param in the middle', async () => {
      netmock.get('https://wix.com/user/:id/photo', (req) => {
        expect(req.params.id).toEqual('5');
      });

      await fetch('https://wix.com/user/5/photo');
      await axios.get('https://wix.com/user/5/photo');
    });

    it('should mock a request url with two params', async () => {
      netmock.get('https://wix.com/:id/:name', (req) => {
        expect(req.params).toEqual({ id: '5', name: 'Peter Parker' });
      });

      await fetch('https://wix.com/5/Peter Parker');
      await fetch('https://wix.com/5/Peter%20Parker');
      await axios.get('https://wix.com/5/Peter Parker');
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
      await axios.get('https://wix.com/5/Peter Parker/photo/New York');
    });
  });

  describe('Query Params', () => {
    it('should mock a request with query', async () => {
      netmock.get('https://wix.com', (req) => {
        if (req.query.blamos) {
          return 'blamos!';
        }
        return 'not blamos';
      });

      expect(await (await fetch('https://wix.com?blamos=true')).text()).toEqual('blamos!');
      expect(await (await fetch('https://wix.com')).text()).toEqual('not blamos');

      expect((await axios.get('https://wix.com?blamos=true')).data).toEqual('blamos!');
      expect((await axios.get('https://wix.com')).data).toEqual('not blamos');
    });

    it('should support more than one query params', async () => {
      netmock.get('https://wix.com', (req) => {
        if (Object.keys(req.query).length > 0) {
          return req.query;
        }
        return null;
      });

      expect(await (await fetch('https://wix.com?firstName=Scarlet&lastName=Johansson')).json()).toEqual({ firstName: 'Scarlet', lastName: 'Johansson' });
      expect((await axios.get('https://wix.com?firstName=Scarlet&lastName=Johansson')).data).toEqual({ firstName: 'Scarlet', lastName: 'Johansson' });
    });

    it('should print warning when trying to mock endpoint with query params', async () => {
      console.warn = jest.fn();
      netmock.get('https://wix.com?blamos=true', () => {});
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Warning: detected query params inside a url for the following mocked endpoint: https://wix.com?blamos=true'));
    });
    it('should allow suppressing the warning using settings', async () => {
      console.warn = jest.fn();
      require('netmock-js').configure({ suppressQueryParamsInUrlWarnings: true });
      netmock.get('https://wix.com?blamos=true', () => {});
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  it('should have convenient request headers', async () => {
    netmock.get('https://wix.com', (req) => {
      expect(req.headers).toEqual(expect.objectContaining({ blamos: 'true' }));
    });
    const headers = new Headers();
    headers.set('blamos', 'true');
    await fetch('https://wix.com', { headers });
    await axios.get('https://wix.com', { headers: { blamos: 'true' } });
  });

  it('should contain the raw request object', async () => {
    netmock.get('https://wix.com', (req) => {
      expect(req.rawRequest instanceof Request).toEqual(true);
    });
    await fetch('https://wix.com');
    await axios.get('https://wix.com');
  });
});
