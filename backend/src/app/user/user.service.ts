import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { UpdateUserDto } from './dto';
import { UserRepository } from './user.repository';
import { join } from 'path';
import { Response } from 'express';

@Injectable({})
export class UserService {
  constructor(private repository: UserRepository) {}

  async me(username: string): Promise<StandardResponse<User>> {
    return this.repository.findOne(username);
  }

  async update(
    username: string,
    updateUserDto: UpdateUserDto,
  ): Promise<StandardResponse<User>> {
    try {
      return await this.repository.update(username, updateUserDto);
    } catch (err) {
      const {
        meta: { target },
      } = err;

      throw new ForbiddenException(`${target} is not available`);
    }
  }

  async uploadAvatar(
    avatar: Express.Multer.File,
    username: string,
  ): Promise<StandardResponse<null>> {
    await this.repository.update(username, {
      avatar: `/media/user/avatar/${username}/${avatar?.filename}`,
    });

    return { success: true };
  }

  async avatar(username: string, res: Response) {
    const { data } = await this.repository.findOne(username);

    return res.sendFile(join(process.cwd(), data.avatar));
  }
}
