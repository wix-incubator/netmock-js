const settings = {
  allowRealNetwork: false as boolean | RegExp,
  suppressQueryParamsInUrlWarnings: false as boolean,
};

export function configure(value: Partial<typeof settings>) {
  Object.assign(settings, value);
}

export function getSettings() {
  return { ...settings };
}

export function isRealNetworkAllowed(url: string) {
  if (typeof settings.allowRealNetwork === 'boolean') {
    return settings.allowRealNetwork;
  }
  return settings.allowRealNetwork.test(url);
}
