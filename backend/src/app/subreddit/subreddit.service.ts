import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadGatewayException,
} from '@nestjs/common';
import { Subreddit, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { StandardResponse } from '../../common/types/standardResponse';
import { CreateSubredditDto, UpdateSubredditDto } from './dto';
import { SubredditRepository } from './subreddit.repository';

@Injectable({})
export class SubredditService {
  constructor(private subreddits: SubredditRepository) {}

  async getAllSubreddits(): Promise<StandardResponse<Subreddit[]>> {
    return await this.subreddits.findAll();
  }

  async getUserSubreddits(
    username: string,
    user: User,
  ): Promise<StandardResponse<Subreddit[]>> {
    if (username !== user.username) {
      throw new NotFoundException();
    }

    return this.subreddits.findAllByUserId(user.id);
  }

  async getSubredditByName(
    subredditName: string,
  ): Promise<StandardResponse<Subreddit>> {
    return this.subreddits.findOne(subredditName);
  }

  async createSubreddit(
    userId: string,
    createSubredditDto: CreateSubredditDto,
  ): Promise<StandardResponse<Subreddit>> {
    try {
      return await this.subreddits.create(userId, createSubredditDto);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(`r/${createSubredditDto.name} is taken`);
        }
      }

      throw error;
    }
  }

  async updateSubredditById(
    subredditId: string,
    userId: string,
    updateSubredditDto: UpdateSubredditDto,
  ): Promise<StandardResponse<Subreddit>> {
    const subreddit = await this.subreddits.exists(subredditId);

    if (subreddit.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return await this.subreddits.update(
      subredditId,
      userId,
      updateSubredditDto,
    );
  }

  async deleteSubredditById(
    subredditId: string,
    userId: string,
  ): Promise<StandardResponse<Subreddit>> {
    await this.subreddits.exists(subredditId);
    const data = await this.subreddits.delete(subredditId, userId);

    if (data) return data;

    throw new BadGatewayException(
      `Failed to delete subreddit with id ${subredditId}`,
    );
  }
}
