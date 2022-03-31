describe('Netlog Tests', () => {
  let netlog: typeof import('../src').netlog;
  let netmock: typeof import('../src').netmock;

  beforeEach(() => {
    netlog = require('netmock-js').netlog;
    netmock = require('netmock-js').netmock;
  });

  it('should allow logging call count', async () => {
    netmock.get('https://www.wix.com', () => ({}));
    expect(netlog('get', 'https://www.wix.com').callCount()).toEqual(0);
    await fetch('https://www.wix.com');
    await fetch('https://www.wix.com');
    expect(netlog('get', 'https://www.wix.com').callCount()).toEqual(2);
  });

  it('should allow logging query params', async () => {
    netmock.get('https://www.wix.com', () => ({}));
    await fetch('https://www.wix.com/?searchParam1=blamos&searchParam2=true');
    await fetch('https://www.wix.com/?searchParam3=blamos3&searchParam4=blamos4');
    expect(netlog('get', 'https://www.wix.com').getRequest(0).query).toEqual({ searchParam1: 'blamos', searchParam2: 'true' });
    expect(netlog('get', 'https://www.wix.com').getRequest(1).query).toEqual({ searchParam3: 'blamos3', searchParam4: 'blamos4' });
  });

  it('should allow logging route params', async () => {
    netmock.post('https://www.wix.com/:id/:user', () => ({}));
    await fetch('https://www.wix.com/123/blamos', { method: 'post' });
    await fetch('https://www.wix.com/456/blamos2', { method: 'post' });
    expect(netlog('post', 'https://www.wix.com/:id/:user').getRequest(0).params).toEqual({ id: '123', user: 'blamos' });
    expect(netlog('post', 'https://www.wix.com/:id/:user').getRequest(1).params).toEqual({ id: '456', user: 'blamos2' });
  });

  it('should work with regex endpoints', async () => {
    netmock.get(/blamos/, () => ({}));
    await fetch('https://blamos.com');
    expect(netlog('get', /blamos/).callCount()).toEqual(1);
  });

  it('should throw error if trying to get incorrect address', async () => {
    expect(() => netlog('get', 'https://www.unmockedUrl.com')).toThrowError('Cannot log unmocked endpoint: get https://www.unmockedUrl.com');
  });
});