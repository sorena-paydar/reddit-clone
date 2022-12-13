import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { UpdateUserDto } from './dto';
import { hasWhiteSpace } from '../../common/utils';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findOne(username: string): Promise<StandardResponse<User>> {
    const userFromDb = await this.prisma.user.findUnique({
      where: { username },
    });

    delete userFromDb.password;

    return { success: true, data: userFromDb };
  }

  async update(
    username: string,
    updateUserDto: UpdateUserDto,
  ): Promise<StandardResponse<User>> {
    // Check if username has whitespace
    if (hasWhiteSpace(updateUserDto.username)) {
      throw new BadRequestException('Username must not contain whitespace');
    }

    let hash: string;

    if (updateUserDto.password) hash = await argon.hash(updateUserDto.password);

    const userFromDb = await this.prisma.user.update({
      where: { username },
      data: { ...updateUserDto, ...(hash && { password: hash }) },
    });

    delete userFromDb.password;

    return { success: true, data: userFromDb };
  }

  /**
   * Checks whether user with given arguments exists or not.
   * @param {Prisma.UserWhereUniqueInput}  Arguments to find a User
   * @return {Promise<User>} return user if it exists
   */
  async exists(where: Prisma.UserWhereUniqueInput): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where,
    });

    // check if post exists
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
