import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadGatewayException,
  BadRequestException,
} from '@nestjs/common';
import { Member, Subreddit, User } from '@prisma/client';
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

  async getSubredditMembers(
    subredditId: string,
  ): Promise<StandardResponse<Member[]>> {
    await this.subreddits.exists(subredditId);

    return this.subreddits.members(subredditId);
  }

  async joinSubreddit(
    subredditId: string,
    userId: string,
  ): Promise<StandardResponse<Member>> {
    await this.subreddits.isOwner(subredditId, userId);
    const isMember = await this.subreddits.isMember(subredditId, userId);

    // check if user is already joined the subreddit
    if (isMember) {
      throw new BadRequestException(
        `User is already joined the subreddit with id ${subredditId}`,
      );
    }

    return this.subreddits.join(subredditId, userId);
  }

  async leaveSubreddit(
    subredditId: string,
    userId: string,
  ): Promise<StandardResponse<Member>> {
    await this.subreddits.isOwner(subredditId, userId);

    const isMember = await this.subreddits.isMember(subredditId, userId);

    // check if user is not member of the subreddit
    if (!isMember) {
      throw new BadRequestException(
        `User is not member of the subreddit with id ${subredditId}`,
      );
    }

    return this.subreddits.leave(subredditId, userId);
  }

  async getUserJoinedSubreddits(username: string, user: User) {
    if (username !== user.username) {
      throw new NotFoundException();
    }

    return this.subreddits.joinedSubreddits(user.id);
  }
}
