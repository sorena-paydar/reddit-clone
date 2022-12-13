/**
 * Checks whether the given string contains whitespace or not.
 * @param {string} string
 * @return {boolean} Returns true if string contains whitespace.
 */
export const hasWhiteSpace = (string: string): boolean => {
  return /\s/g.test(string);
};
