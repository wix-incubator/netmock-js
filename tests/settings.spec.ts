import axios from 'axios';

describe('Settings', () => {
  it('should throw an exception if network is disabled and an unmocked request is fetched', async () => {
    require('netmock-js').allowRealNetwork(false);
    await expect(() => fetch('https://wix.com')).rejects.toThrow('Endpoint not mocked');
    await expect(() => axios.get('https://wix.com')).rejects.toThrow('Endpoint not mocked');
  });

  it('should make a real network call if network is enabled and an unmocked request is fetched', async () => {
    require('netmock-js').allowRealNetwork(true);
    await expect(async () => {
      await fetch('https://this-site-does-not-exist-niryo.com');
    }).rejects.toThrowError('ENOTFOUND');

    await expect(async () => {
      await axios.get('https://this-site-does-not-exist-niryo.com');
    }).rejects.toThrowError('ENOTFOUND');
  });

  it('should allow real network to specific url pattern', async () => {
    require('netmock-js').allowRealNetwork(/this-site-does-not-exist-niryo/);
    await expect(async () => {
      await fetch('https://this-site-does-not-exist-niryo.com');
    }).rejects.toThrowError('ENOTFOUND');

    await expect(fetch('https://wix.com')).rejects.toThrowError('Endpoint not mocked: GET https://wix.com');
    await expect(axios.get('https://this-site-does-not-exist-niryo.com')).rejects.toThrowError('ENOTFOUND');
    await expect(axios.get('https://wix.com')).rejects.toThrowError('Endpoint not mocked: GET https://wix.com');
  });
});
