import { NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

interface Param {
  id?: string;
  username?: string;
}

/**
 * Checks whether given param matches with requested user or not.
 * @param {Param} param - Username in URL
 * @param {User} user - Requested User
 */
export function checkUserParam(param: Param, user: User): void {
  /**
   * check if given param values are equal to requested user
   */
  Object.entries(param).forEach((entry) => {
    const [key, value] = entry;

    checkValue(user, key, value);
  });
}

function checkValue(user: User, key: string, value: string): void {
  if (value !== user[key]) {
    throw new NotFoundException(`${key} was not found`);
  }
}
