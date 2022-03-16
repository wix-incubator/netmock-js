/**
 * Base tests for the Netmock library.
 * These tests cover the basic operations of Netmock.
 */

import { Netmock } from '../src/types/netmock';

describe('Base Netmock Tests', () => {
  let netmock: Netmock;

  function fetchData() {
    return fetch('https://wix.com');
  }

  beforeEach(() => {
    netmock = require('..').default;
  });

  it('should throw an exception if network is disabled and an unmocked request is fetched', async () => {
    netmock.settings.disableNetwork();

    await expect(fetchData).toThrow('Endpoint not mocked');
  });

  it('should make a real network call if network is enabled and an unmocked request is fetched', async () => {
    netmock.settings.enableNetwork();

    await expect(fetchData()).resolves.toBeDefined();
  });
});
