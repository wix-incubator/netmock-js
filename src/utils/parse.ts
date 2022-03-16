/**
 * Validate if a string ends with a slash (/),
 * if yes, return the string,
 * otherwise, return the same string with a slash in the end.
 * @param {string} str The string to check.
 * @return {string} The same sting ends with slash
 */
export function endStringWithSlash(str: string) {
  const lastChar = str.slice(-1);
  if (lastChar === '/') {
    return str;
  }
  return str.concat('/');
}
