import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Image, StandardResponse } from '../../common/types/standardResponse';
import { UpdateUserDto } from './dto';
import { UserRepository } from './user.repository';

@Injectable({})
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async me(username: string): Promise<StandardResponse<User>> {
    return this.userRepository.findOne(username);
  }

  async update(
    username: string,
    updateUserDto: UpdateUserDto,
  ): Promise<StandardResponse<User>> {
    try {
      return await this.userRepository.update(username, updateUserDto);
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
  ): Promise<StandardResponse<Image>> {
    const { data } = await this.userRepository.update(username, {
      avatar: `users/${username}/avatar/${avatar.filename}`,
    });

    return { success: true, data: { imageUrl: data.avatar } };
  }
}
