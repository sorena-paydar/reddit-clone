import { Injectable, ForbiddenException } from '@nestjs/common';
import { User } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSubredditDto } from '../subreddit/dto';

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
    updateUserDto: UpdateSubredditDto,
  ): Promise<StandardResponse<User>> {
    const userFromDb = await this.prisma.user.update({
      where: { username },
      data: { ...updateUserDto },
    });

    delete userFromDb.password;

    return { success: true, data: userFromDb };
  }
}
