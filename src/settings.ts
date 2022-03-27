const settings = {
  allowRealNetwork: false,
};

export function isRealNetworkAllowed() {
  return settings.allowRealNetwork;
}

export function allowRealNetwork(value: boolean) {
  settings.allowRealNetwork = value;
}
