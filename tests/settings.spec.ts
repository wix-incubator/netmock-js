import axios from 'axios';

describe('Settings', () => {
  let configure: typeof import('../src/settings').configure;
  beforeEach(() => {
    configure = require('netmock-js').configure;
  });
  it('setting one configuration should not override the other', () => {
    configure({ allowRealNetwork: true });
    configure({ suppressQueryParamsInUrlWarnings: true });
    expect(require('../src/settings').settings).toEqual({
      allowRealNetwork: true,
      suppressQueryParamsInUrlWarnings: true,
    });
  });

  it('should throw an exception if network is disabled and an unmocked request is fetched', async () => {
    configure({ allowRealNetwork: false });
    await expect(() => fetch('https://wix.com')).rejects.toThrow('Endpoint not mocked');
    await expect(() => axios.get('https://wix.com')).rejects.toThrow('Endpoint not mocked');
  });

  it('should make a real network call if network is enabled and an unmocked request is fetched', async () => {
    configure({ allowRealNetwork: true });
    await expect(fetch('https://this-site-does-not-exist-niryo.com')).rejects.toThrowError('ENOTFOUND');
    await expect(axios.get('https://this-site-does-not-exist-niryo.com')).rejects.toThrowError('ENOTFOUND');
  });

  it('should allow real network to specific url pattern', async () => {
    configure({ allowRealNetwork: /this-site-does-not-exist-niryo/ });
    await expect(fetch('https://this-site-does-not-exist-niryo.com')).rejects.toThrowError('ENOTFOUND');
    await expect(fetch('https://wix.com')).rejects.toThrowError('Endpoint not mocked: GET https://wix.com');
    await expect(axios.get('https://this-site-does-not-exist-niryo.com')).rejects.toThrowError('ENOTFOUND');
    await expect(axios.get('https://wix.com')).rejects.toThrowError('Endpoint not mocked: GET https://wix.com');
  });
});
