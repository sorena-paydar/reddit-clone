import {
  NotFoundException,
  Injectable,
  ForbiddenException,
  BadGatewayException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable({})
export class UserService {
  constructor(private prisma: PrismaService) {}

  async me(username: string, user: User): Promise<User> {
    /**
     * check if username in query is equal to requested user
     */
    if (username !== user.username) {
      throw new NotFoundException('Not user found');
    }

    try {
      const userFromDb = await this.prisma.user.findUnique({
        where: { username },
      });

      delete userFromDb.password;

      return userFromDb;
    } catch (err) {
      throw new BadGatewayException();
    }
  }

  async update(
    username: string,
    user: User,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    /**
     * check if username in query is equal to requested user
     */
    if (username !== user.username) {
      throw new NotFoundException('User not found');
    }

    try {
      const userFromDb = await this.prisma.user.update({
        where: { username },
        data: { ...updateUserDto },
      });

      delete userFromDb.password;

      return userFromDb;
    } catch (err) {
      const {
        meta: { target },
      } = err;

      throw new ForbiddenException(`Credentials taken [${target}]`);
    }
  }
}
