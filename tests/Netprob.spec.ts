describe('Netprob Tests', () => {
  let netprob: typeof import('../src').netprob;
  let netmock: typeof import('../src').netmock;

  beforeEach(() => {
    netprob = require('../src').netprob;
    netmock = require('../src').netmock;
  });

  it('should allow probing call count', async () => {
    netmock.get('https://www.wix.com', () => ({}));
    expect(netprob('get', 'https://www.wix.com').callCount()).toEqual(0);
    await fetch('https://www.wix.com');
    await fetch('https://www.wix.com');
    expect(netprob('get', 'https://www.wix.com').callCount()).toEqual(2);
  });

  it('should allow probing query params', async () => {
    netmock.get('https://www.wix.com', () => ({}));
    await fetch('https://www.wix.com/?searchParam1=blamos&searchParam2=true');
    await fetch('https://www.wix.com/?searchParam3=blamos3&searchParam4=blamos4');
    expect(netprob('get', 'https://www.wix.com').getRequest(0).query).toEqual({ searchParam1: 'blamos', searchParam2: 'true' });
    expect(netprob('get', 'https://www.wix.com').getRequest(1).query).toEqual({ searchParam3: 'blamos3', searchParam4: 'blamos4' });
  });

  it('should allow probing route params', async () => {
    netmock.post('https://www.wix.com/:id/:user', () => ({}));
    await fetch('https://www.wix.com/123/blamos', { method: 'post' });
    await fetch('https://www.wix.com/456/blamos2', { method: 'post' });
    expect(netprob('post', 'https://www.wix.com/:id/:user').getRequest(0).params).toEqual({ id: '123', user: 'blamos' });
    expect(netprob('post', 'https://www.wix.com/:id/:user').getRequest(1).params).toEqual({ id: '456', user: 'blamos2' });
  });

  it('should work with regex endpoints', async () => {
    netmock.get(/blamos/, () => ({}));
    await fetch('https://blamos.com');
    expect(netprob('get', /blamos/).callCount()).toEqual(1);
  });

  it('should throw error if trying to get incorrect address', async () => {
    expect(() => netprob('get', 'https://www.unmockedUrl.com')).toThrowError('Cannot prob unmocked endpoint: get https://www.unmockedUrl.com');
  });
});
