import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { UpdateUserDto } from './dto';

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
    let hash: string;

    if (updateUserDto.password) hash = await argon.hash(updateUserDto.password);

    const userFromDb = await this.prisma.user.update({
      where: { username },
      data: { ...updateUserDto, ...(hash && { password: hash }) },
    });

    delete userFromDb.password;

    return { success: true, data: userFromDb };
  }
}
