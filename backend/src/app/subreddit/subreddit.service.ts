import {
  Injectable,
  NotFoundException,
  BadGatewayException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Member, Subreddit, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Image, StandardResponse } from '../../common/types/standardResponse';
import { CreateSubredditDto, UpdateSubredditDto } from './dto';
import { SubredditRepository } from './subreddit.repository';

@Injectable({})
export class SubredditService {
  constructor(
    private subreddits: SubredditRepository,
    private config: ConfigService,
  ) {}

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
    avatar: Express.Multer.File,
  ): Promise<StandardResponse<Subreddit>> {
    try {
      return await this.subreddits.create(userId, createSubredditDto, avatar);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`r/${createSubredditDto.name} is taken`);
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
    await this.subreddits.hasPermission(userId, subredditId);

    try {
      return await this.subreddits.update(subredditId, updateSubredditDto);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`r/${updateSubredditDto.name} is taken`);
        }
      }

      throw error;
    }
  }

  async deleteSubredditById(
    subredditId: string,
    userId: string,
  ): Promise<StandardResponse<Subreddit>> {
    await this.subreddits.hasPermission(userId, subredditId);

    const data = await this.subreddits.delete(subredditId);

    if (data) return data;

    throw new BadGatewayException(
      `Failed to delete subreddit with id ${subredditId}`,
    );
  }

  async getSubredditMembers(
    subredditId: string,
  ): Promise<StandardResponse<Member[]>> {
    await this.subreddits.exists({ id: subredditId });

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

  async getUserJoinedSubreddits(
    username: string,
    user: User,
  ): Promise<StandardResponse<Subreddit[]>> {
    if (username !== user.username) {
      throw new NotFoundException();
    }

    return this.subreddits.joinedSubreddits(user.id);
  }

  async uploadAvatar(
    avatar: Express.Multer.File,
    subredditName: string,
    userId: string,
  ): Promise<StandardResponse<Image>> {
    // Get subreddit by name
    const {
      data: { id },
    } = await this.subreddits.findOne(subredditName);

    await this.subreddits.hasPermission(userId, id);

    // Update subreddit by id
    const { data } = await this.subreddits.update(id, {
      avatar: `${this.config.get('BASE_URL')}/static/${avatar.filename}`,
    });

    return { success: true, data: { imageUrl: data.avatar } };
  }
}
