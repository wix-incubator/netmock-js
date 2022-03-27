import { MethodType } from './types';

export function getUrl(input: RequestInfo): string {
  if (typeof input === 'string') { // If input is a string, it is the url
    return input;
  }
  // Otherwise, input is a Request
  return input.url;
}

export function getMockedEndpointKey(input: RequestInfo | RegExp): string {
  if (input instanceof RegExp) {
    return `${input}`;
  }
  const parsedUrl = new URL(getUrl(input));
  const cleanUrl = parsedUrl.origin + parsedUrl.pathname;
  return cleanUrl.endsWith('/') ? cleanUrl.slice(0, -1) : cleanUrl;
}

export function getRequestMethod(input: RequestInfo, init?: RequestInit): MethodType {
  if (typeof input === 'object') { // input is a Request instance
    return input.method.toLowerCase() as MethodType;
  }
  return init?.method ? init.method.toLowerCase() as MethodType : 'get';
}

function escapeRegExpChars(str: string) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function convertUrlToRegex(str: string) {
  const url = str.endsWith('/') ? str.slice(0, -1) : str;
  const escapedStr = escapeRegExpChars(url);
  let urlRegex = escapedStr.replace(/\/:[^/]+/g, (currentMatch) => {
    const paramName = currentMatch.replace('/:', '');
    return `/(?<${paramName}>[^/]+)`;
  });
  urlRegex = `^${urlRegex}/?$`;
  return new RegExp(urlRegex);
}
