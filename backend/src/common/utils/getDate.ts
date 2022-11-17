/**
 * @return {Date} current date in YYYY-MM-DD format.
 */
export const getDate = (): string => new Date().toJSON().slice(0, 10);
