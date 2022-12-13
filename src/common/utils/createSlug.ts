import slugify from 'slugify';
import { randomString } from './randomString';

interface Options {
  replacement?: string; // replace spaces with replacement character, defaults to `-`
  remove?: RegExp; // remove characters that match regex, defaults to `undefined`
  lower?: boolean; // convert to lower case, defaults to `false`
  strict?: boolean; // strip special characters except replacement, defaults to `false`
  locale?: string; // language code of the locale to use
  trim?: boolean; // trim leading and trailing replacement chars, defaults to `true`
}

/**
 * Create unique slug with random character and given string.
 * @param {string} - The string to be slugified
 * @param {number} [length=string.length] - The length of the slug
 * @param {Options} - Slugify options
 * @return {string} unique slug.
 */
export const createSlug = (
  string: string,
  options?: Options,
  length = string.length,
): string => `${randomString(6)}_${slugify(string.slice(0, length), options)}`;
