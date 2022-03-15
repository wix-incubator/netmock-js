/**
 * Base tests for the Netmock library.
 * These tests cover the basic operations of Netmock.
 */

import { Netmock } from '../src/types/netmock';

describe('Base Netmock Tests', () => {
  let netmock: Netmock;

  function fetchEndpoint() {
    return fetch('https://wix.com');
  }

  beforeEach(() => {
    netmock = require('..').default;
  });

  it('should make a real network call if network is enabled and an unmocked request is fetched', async () => {
    netmock.settings.enableNetwork();

    await expect(fetchEndpoint()).resolves.toBeDefined();
  });

  it('should throw an exception if network is disabled and an unmocked request is fetched', async () => {
    netmock.settings.disableNetwork();

    await expect(fetchEndpoint).toThrow('Endpoint not mocked');
  });
});
