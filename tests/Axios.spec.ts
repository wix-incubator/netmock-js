describe('axios support', () => {
  it('should allow mocking a specific axios instance', async () => {
    const fakeAxiosInstance = { defaults: { adapter: jest.fn() } };
    jest.mock('../src/axios-fetch-adapter', () => ({ default: 'mockedAdapter' }));
    require('netmock-js').mockAxios(fakeAxiosInstance);
    expect(fakeAxiosInstance.defaults.adapter).toEqual('mockedAdapter');
  });
});
