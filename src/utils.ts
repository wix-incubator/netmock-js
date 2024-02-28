import { Method, MockedUrl } from './types';

export function getUrl(input: RequestInfo): string {
  if (typeof input === 'string') { // If input is a string, it is the url
    return input;
  }
  // Otherwise, input is a Request
  return input.url;
}

export function getHeadersForHttp(request: HttpRequest) {
  const initialHeaders = request.headers || {};
  return Object.keys(initialHeaders).reduce((prev, cur) => ({ ...prev, [cur]: initialHeaders[cur]?.toString() }), {});
}

export function parseQueryForHttp(request: HttpRequest) {
  const queryString = request.query || request.search;
  if (!queryString) {
    return '';
  }
  const query: { [key: string]: string } = {};
  const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  pairs.forEach((item) => {
    const pair = item.split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  });
  return query;
}

export function getUrlForHttp(request: HttpRequest): string {
  return decodeURI((request.protocol ?? 'http:').concat('//').concat(request.hostname ?? '').concat(request.path ?? ''));
}
export function getMockedEndpointKey(input: RequestInfo | RegExp): string {
  if (input instanceof RegExp) {
    return `${input}`;
  }
  const parsedUrl = new URL(getUrl(input));
  const cleanUrl = parsedUrl.origin + parsedUrl.pathname;
  return cleanUrl.endsWith('/') ? cleanUrl.slice(0, -1) : cleanUrl;
}

export function getMockedEndpointKeyForHttp(request: HttpRequest | MockedUrl): string {
  if (request instanceof RegExp || typeof request === 'string') {
    return `${request}`;
  }
  const parsedUrl = new URL(getUrlForHttp(request));
  const cleanUrl = parsedUrl.origin + parsedUrl.pathname;
  return cleanUrl.endsWith('/') ? cleanUrl.slice(0, -1) : cleanUrl;
}

export function getRequestMethod(input: RequestInfo, init?: RequestInit): Method {
  if (typeof input === 'object') { // input is a Request instance
    return input.method.toLowerCase() as Method;
  }
  return init?.method ? init.method.toLowerCase() as Method : 'get';
}

export function getRequestMethodForHttp(request: HttpRequest): Method {
  return request?.method ? request.method.toLowerCase() as Method : 'get';
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

export function captureStack(fn: Function) {
  const obj = { stack: '' };
  Error.captureStackTrace(obj, fn);
  return obj.stack;
}

export function getErrorWithCorrectStack(errorMessage: string, stack: string) {
  const error = new Error(errorMessage);
  error.stack = `${errorMessage}\n${stack}`;
  return error;
}

export function isLocalhostUrl(url: string) {
  const localhostURLs = [
    'http://localhost',
    'http://127.0.0.1',
    'http://[::1]',
  ];
  return localhostURLs.some((localhostURL) => url.indexOf(localhostURL) === 0);
}
