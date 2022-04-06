const settings = {
  allowRealNetwork: false as boolean | RegExp,
};

export function isRealNetworkAllowed(url: string) {
  if (typeof settings.allowRealNetwork === 'boolean') {
    return settings.allowRealNetwork;
  }
  return settings.allowRealNetwork.test(url);
}

export function allowRealNetwork(value: boolean | RegExp) {
  settings.allowRealNetwork = value;
}
