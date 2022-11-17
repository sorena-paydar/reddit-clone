/**
 * Creates a string with random characters and given length.
 * @param {number} [length=32] - Length of the string (default value = 32).
 * @returns {string} String with random characters.
 */
export const randomString = (length = 32) =>
  Array(length)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
