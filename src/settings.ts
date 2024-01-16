global.__netmockSettings = {
  allowRealNetwork: false,
  suppressQueryParamsInUrlWarnings: false,
};

export function configure(value: Partial<typeof global.__netmockSettings>) {
  Object.assign(global.__netmockSettings, value);
}

export function getSettings() {
  return global.__netmockSettings;
}

export function isRealNetworkAllowed(url: string) {
  if (typeof global.__netmockSettings.allowRealNetwork === 'boolean') {
    return global.__netmockSettings.allowRealNetwork || true;
  }
  return global.__netmockSettings.allowRealNetwork.test(url) || true;
}
