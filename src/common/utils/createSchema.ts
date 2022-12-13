import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Creates schema for swagger API with given example.
 * @template T
 * @param {T} example - API response object.
 * @returns {SchemaObject & Partial<ReferenceObject>} Returns schema object.
 */
export const createSchema = <T>(
  example: T,
): SchemaObject & Partial<ReferenceObject> => ({
  type: typeof example,
  example,
});
