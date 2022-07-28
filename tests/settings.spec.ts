import axios from 'axios';

describe('Settings', () => {
  it('should throw an exception if network is disabled and an unmocked request is fetched', async () => {
    require('netmock-js').allowRealNetwork(false);
    await expect(() => fetch('https://wix.com')).rejects.toThrow('Endpoint not mocked');
    await expect(() => axios.get('https://wix.com')).rejects.toThrow('Endpoint not mocked');
  });

  it('should make a real network call if network is enabled and an unmocked request is fetched', async () => {
    require('netmock-js').allowRealNetwork(true);
    await fetch('https://wix.com');
    await axios.get('https://wix.com');
    await expect((global as any).fetchSpy).toHaveBeenNthCalledWith(1, 'https://wix.com', undefined);
    await expect((global as any).fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('should allow real network to specific url pattern', async () => {
    require('netmock-js').allowRealNetwork(/wix/);
    await fetch('https://wix.com');
    await axios.get('https://wix.com');
    try {
      await fetch('https://blamos.com');
      await axios.get('https://blamos.com');
    } catch {
      // do nothing
    }
    await expect((global as any).fetchSpy).toHaveBeenCalledWith('https://wix.com', undefined);
    await expect((global as any).fetchSpy).toHaveBeenCalledTimes(2);
  });
});
