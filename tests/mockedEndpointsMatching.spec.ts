import axios from 'axios';
import { Method } from '../src/types';

describe('Mocked Endpoints Match Tests', () => {
  let netmock: typeof import('../src').netmock;

  beforeEach(() => {
    netmock = require('netmock-js').netmock;
  });

  it('should print a hint on suspected wrong mocked method', async () => {
    const resMissFetch = () => fetch('https://wix.com', { method: 'post' });
    const resMissAxios = () => axios.post('https://wix.com');
    await expect(resMissFetch).rejects.toThrowError(new Error('request to https://wix.com/ failed, reason: Endpoint not mocked: POST https://wix.com/'));
    await expect(resMissAxios).rejects.toThrowError(new Error('Endpoint not mocked: POST https://wix.com/'));
    netmock.get('https://wix.com', () => 'Mocked Text');
    await expect(resMissFetch).rejects.toThrowError(new Error('request to https://wix.com/ failed, reason: Endpoint not mocked: POST https://wix.com/\nThe request is of type POST but netmock could only find mocks for GET'));
    await expect(resMissAxios).rejects.toThrowError(new Error('Endpoint not mocked: POST https://wix.com/\nThe request is of type POST but netmock could only find mocks for GET'));
    netmock.put('https://wix.com', () => 'Mocked Text');
    await expect(resMissFetch).rejects.toThrowError(new Error('request to https://wix.com/ failed, reason: Endpoint not mocked: POST https://wix.com/\nThe request is of type POST but netmock could only find mocks for GET,PUT'));
    await expect(resMissAxios).rejects.toThrowError(new Error('Endpoint not mocked: POST https://wix.com/\nThe request is of type POST but netmock could only find mocks for GET,PUT'));
  });

  it('should match an explicit url', async () => {
    netmock.get('https://wix.com/exact/route/to/match', () => 'Mocked Text');

    expect(await fetch('https://wix.com/exact/route/to/match')).toBeDefined();
    expect(await axios.get('https://wix.com/exact/route/to/match')).toBeDefined();
    await expect(fetch('https://wix.com/exact/route/match')).rejects.toThrowError(new Error('request to https://wix.com/exact/route/match failed, reason: Endpoint not mocked: GET https://wix.com/exact/route/match'));
    await expect(axios.get('https://wix.com/exact/route/match')).rejects.toThrowError(new Error('Endpoint not mocked: GET https://wix.com/exact/route/match'));
  });

  it('should match a RegExp', async () => {
    const re = /regexp[/].+$/; // Include 'regexp' but not at the end
    netmock.get(re, () => 'Mocked Text');

    expect(await fetch('https://wix.com/route/with/regexp/match')).toBeDefined();
    expect(await axios.get('https://wix.com/route/with/regexp/match')).toBeDefined();
    await expect(() => fetch('https://wix.com/regular/route/')).rejects.toThrowError(new Error('request to https://wix.com/regular/route/ failed, reason: Endpoint not mocked: GET https://wix.com/regular/route/'));
    await expect(() => axios.get('https://wix.com/regular/route/')).rejects.toThrowError(new Error('Endpoint not mocked: GET https://wix.com/regular/route/'));
  });

  it('should match a dynamic url', async () => {
    netmock.get('https://wix.com/dynamic/route/:id/match', () => 'Mocked Text');

    expect(await fetch('https://wix.com/dynamic/route/1024/match')).toBeDefined();
    expect(await axios.get('https://wix.com/dynamic/route/1024/match')).toBeDefined();
    await expect(() => fetch('https://wix.com/dynamic/route/1024')).rejects.toThrowError('Endpoint not mocked');
    await expect(() => axios.get('https://wix.com/dynamic/route/1024')).rejects.toThrowError('Endpoint not mocked');
  });

  describe('Mocked Endpoint Hierarchy', () => {
    it('should intercept a post request but not a get request to the same route', async () => {
      netmock.post('https://wix.com', () => 'Mocked Text');

      expect(await (await fetch('https://wix.com', { method: 'POST' })).text()).toBe('Mocked Text');
      expect((await axios.post('https://wix.com')).data).toBe('Mocked Text');
      await expect(() => fetch('https://wix.com')).rejects.toThrowError('Endpoint not mocked: GET https://wix.com');
      await expect(() => axios.get('https://wix.com')).rejects.toThrowError('Endpoint not mocked: GET https://wix.com');
    });
    it('should override a mocked endpoint if mocked the same url twice', async () => {
      netmock.get('https://wix.com', () => 'Mocked Text');
      netmock.get('https://wix.com', () => 'Text Override');

      expect(await (await fetch('https://wix.com')).text()).toBe('Text Override');
      expect((await axios.get('https://wix.com')).data).toBe('Text Override');
    });

    it('should intercept a direct mock over regexp and dynamic', async () => {
      netmock.get('https://wix.com/exact/route/to/match', () => 'Exact Match');
      netmock.get(/exact/, () => 'RegExp Match');
      netmock.get('https://wix.com/:dynamic/route/to/match', () => 'Dynamic Match');

      expect(await (await fetch('https://wix.com/exact/route/to/match')).text()).toBe('Exact Match');
      expect((await axios.get('https://wix.com/exact/route/to/match')).data).toBe('Exact Match');
    });

    it('should intercept a regexp mock over dynamic', async () => {
      netmock.get(/regexp/, () => 'RegExp Match');
      netmock.get('https://wix.com/:dynamic/but/to/regexp', () => 'Dynamic Match');

      expect(await (await fetch('https://wix.com/123/but/to/regexp')).text()).toBe('RegExp Match');
      expect((await axios.get('https://wix.com/123/but/to/regexp')).data).toBe('RegExp Match');
    });
  });

  it('should match get, post, put,patch and delete when supplied as explicit method', async () => {
    function mockUrl(url: string, method: Method) {
      netmock[method](url, () => method);
    }
    async function testUrl(url: string, method: Method) {
      expect(await (await fetch(url, { method })).text()).toBe(method);
      expect(await (await axios(url, { method })).data).toBe(method);
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
    expect(await (await fetch('https://wix.com')).text()).toBe('Mocked Text');
    expect((await axios('https://wix.com')).data).toBe('Mocked Text');
  });
});
