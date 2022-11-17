import { NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

/**
 * Checks whether username match with requested user according to execution context or not.
 * @param {string} username - Username in URL
 * @param {User} user - Requested User
 */
export function checkUsername(username: string, user: User): void {
  /**
   * check if username is equal to requested user's username
   */
  if (username !== user.username) {
    throw new NotFoundException(`${username} was not found`);
  }
}
