import { Method } from '../src/types';

describe('Mocked Endpoints Match Tests', () => {
  let netmock: typeof import('../src').netmock;

  beforeEach(() => {
    netmock = require('../src').netmock;
  });

  it('should ', () => {

  });

  it('should match an explicit url', async () => {
    netmock.get('https://wix.com/exact/route/to/match', () => 'Mocked Text');

    const resHit = await fetch('https://wix.com/exact/route/to/match');
    const resMiss = () => fetch('https://wix.com/exact/route/match');

    expect(resHit).toBeDefined();
    await expect(resMiss).rejects.toThrow('Endpoint not mocked');
  });

  it('should match a RegExp', async () => {
    const re = /regexp[/].+$/; // Include 'regexp' but not at the end
    netmock.get(re, () => 'Mocked Text');

    const resHit = await fetch('https://wix.com/route/with/regexp/match');
    const resMiss = () => fetch('https://wix.com/regular/route/');

    expect(resHit).toBeDefined();
    await expect(resMiss).rejects.toThrow('Endpoint not mocked');
  });

  it('should match a dynamic url', async () => {
    netmock.get('https://wix.com/dynamic/route/:id/match', () => 'Mocked Text');

    const resHit = await fetch('https://wix.com/dynamic/route/1024/match');
    const resMiss = () => fetch('https://wix.com/dynamic/route/1024');

    expect(resHit).toBeDefined();
    await expect(resMiss).rejects.toThrow('Endpoint not mocked');
  });

  describe('Mocked Endpoint Hierarchy', () => {
    it('should intercept a post request but not a get request to the same route', async () => {
      netmock.post('https://wix.com', () => 'Mocked Text');

      const resHit = await fetch('https://wix.com', { method: 'POST' });
      const resMiss = () => fetch('https://wix.com');
      const bodyHit = await resHit.text();

      expect(bodyHit).toBe('Mocked Text');
      await expect(resMiss).rejects.toThrow('Endpoint not mocked: GET https://wix.com');
    });
    it('should override a mocked endpoint if mocked the same url twice', async () => {
      netmock.get('https://wix.com', () => 'Mocked Text');
      netmock.get('https://wix.com', () => 'Text Override');

      const res = await fetch('https://wix.com');
      const body = await res.text();

      expect(body).toBe('Text Override');
    });

    it('should intercept a direct mock over regexp and dynamic', async () => {
      netmock.get('https://wix.com/exact/route/to/match', () => 'Exact Match');
      netmock.get(/exact/, () => 'RegExp Match');
      netmock.get('https://wix.com/:dynamic/route/to/match', () => 'Dynamic Match');

      const res = await fetch('https://wix.com/exact/route/to/match');
      const body = await res.text();

      expect(body).toBe('Exact Match');
    });

    it('should intercept a regexp mock over dynamic', async () => {
      netmock.get(/regexp/, () => 'RegExp Match');
      netmock.get('https://wix.com/:dynamic/but/to/regexp', () => 'Dynamic Match');

      const res = await fetch('https://wix.com/123/but/to/regexp');
      const body = await res.text();

      expect(body).toBe('RegExp Match');
    });
  });

  it('should match get, post, put,patch and delete when supplied as explicit method', async () => {
    function mockUrl(url: string, method: Method) {
      netmock[method](url, () => method);
    }
    async function testUrl(url: string, method: Method) {
      const res = await fetch(url, { method });
      const body = await res.text();
      expect(body).toBe(method);
    }
    mockUrl('https://a.com', 'get');
    mockUrl('https://b.com', 'post');
    mockUrl('https://c.com', 'put');
    mockUrl('https://d.com', 'patch');
    mockUrl('https://e.com', 'delete');

    await testUrl('https://a.com', 'get');
    await testUrl('https://b.com', 'post');
    await testUrl('https://c.com', 'put');
    await testUrl('https://d.com', 'patch');
    await testUrl('https://e.com', 'delete');
  });

  it('should match an implicit get request (calling fetch without method parameter)', async () => {
    netmock.get('https://wix.com', () => 'Mocked Text');
    const res = await fetch('https://wix.com');
    const body = await res.text();
    expect(body).toBe('Mocked Text');
  });
});
