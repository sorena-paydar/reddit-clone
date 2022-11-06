import {
  NotFoundException,
  Injectable,
  ForbiddenException,
  BadGatewayException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable({})
export class UserService {
  constructor(private prisma: PrismaService) {}

  async me(username: string, user: User): Promise<StandardResponse<User>> {
    /**
     * check if username in query is equal to requested user
     */
    if (username !== user.username) {
      throw new NotFoundException(`${username} was not found`);
    }

    try {
      const userFromDb = await this.prisma.user.findUnique({
        where: { username },
      });

      delete userFromDb.password;

      return { success: true, data: userFromDb };
    } catch (err) {
      throw new BadGatewayException();
    }
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
      const userFromDb = await this.prisma.user.update({
        where: { username },
        data: { ...updateUserDto },
      });

      delete userFromDb.password;

      return { success: true, data: userFromDb };
    } catch (err) {
      const {
        meta: { target },
      } = err;

      throw new ForbiddenException(`${target} is not available`);
    }
  }
}
