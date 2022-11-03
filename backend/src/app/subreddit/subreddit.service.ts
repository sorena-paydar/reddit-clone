import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Subreddit, User } from '@prisma/client';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubredditDto, UpdateSubredditDto } from './dto';

@Injectable({})
export class SubredditService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<Subreddit[]> {
    return this.prisma.subreddit.findMany();
  }

  findUserSubreddits(username: string, user: User): Promise<Subreddit[]> {
    if (username !== user.username) {
      throw new NotFoundException();
    }

    return this.prisma.subreddit.findMany({
      where: { userId: user.id },
    });
  }

  async findOne(name: string): Promise<Subreddit> {
    const subreddit = await this.prisma.subreddit.findFirst({
      where: {
        name,
      },
    });

    if (!subreddit) {
      throw new NotFoundException('Subreddit not found');
    }

    return subreddit;
  }

  async create(
    userId: string,
    createSubredditDto: CreateSubredditDto,
  ): Promise<Subreddit> {
    try {
      const subreddit = await this.prisma.subreddit.create({
        data: {
          userId,
          ...createSubredditDto,
        },
      });

      return subreddit;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(`r/${createSubredditDto.name} is taken`);
        }
      }

      if (error instanceof PrismaClientValidationError) {
        throw new BadRequestException();
      }

      throw error;
    }
  }

  async update(
    subredditId: string,
    userId: string,
    updateSubredditDto: UpdateSubredditDto,
  ): Promise<Subreddit> {
    const subreddit = await this.prisma.subreddit.findUnique({
      where: { id: subredditId },
    });

    if (!subreddit) {
      throw new NotFoundException('Subreddit not found');
    }

    if (subreddit.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.subreddit.update({
      where: {
        id: subredditId,
      },
      data: {
        ...updateSubredditDto,
      },
    });
  }

  async delete(subredditId: string, userId: string) {
    const subreddit = await this.prisma.subreddit.findUnique({
      where: { id: subredditId },
    });

    if (!subreddit) {
      throw new NotFoundException('Subreddit not found');
    }

    if (subreddit.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.subreddit.delete({
      where: { id: subredditId },
    });
  }
}
