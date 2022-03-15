/**
 * Base tests for the Netmock library.
 * These tests cover the basic operations of Netmock.
 */

import netmock from '..';

describe('Base Netmock Tests', () => {
  it('should mock http.request function', async () => {
    netmock.mock.get('http://localhost:8080', (_: any) => 'Hello');
    const res = await fetch('http://localhost:8080', { method: 'GET' });
    const body = await res.text();

    expect(body).toBe('Hello');
  });

  it('should mock http.request function', async () => {
    netmock.mock.get('http://wix.com', (_: any) => 'Hello');
    const res = await fetch('http://wix.com', { method: 'GET' });
    const body = await res.text();

    expect(body).toBe('Hello');
  });

  it('should mock https.request function', async () => {
    netmock.mock.get('https://wix.com', (_: any) => 'Hello');
    const res = await fetch('https://wix.com', { method: 'GET' });
    const body = await res.text();

    expect(body).toBe('Hello');
  });
});
