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

async function fetchData() {
  return fetch('https://wix.com');
}
