import {
  NotFoundException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { UpdateUserDto } from './dto';
import { UserRepository } from './user.repository';

@Injectable({})
export class UserService {
  constructor(private repository: UserRepository) {}

  async me(username: string, user: User): Promise<StandardResponse<User>> {
    /**
     * check if username in query is equal to requested user
     */
    if (username !== user.username) {
      throw new NotFoundException(`${username} was not found`);
    }

    return this.repository.findOne(username);
  }

  async update(
    username: string,
    user: User,
    updateUserDto: UpdateUserDto,
  ): Promise<StandardResponse<User>> {
    /**
     * check if username in query is equal to requested user
     */
    if (username !== user.username) {
      throw new NotFoundException(`${username} was not found`);
    }

    try {
      return await this.repository.update(username, updateUserDto);
    } catch (err) {
      const {
        meta: { target },
      } = err;

      throw new ForbiddenException(`${target} is not available`);
    }
  }
}
