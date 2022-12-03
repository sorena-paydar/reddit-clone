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
    private subredditRepository: SubredditRepository,
    private config: ConfigService,
  ) {}

  async getAllSubreddits(): Promise<StandardResponse<Subreddit[]>> {
    return await this.subredditRepository.findAll();
  }

  async getUserSubreddits(
    username: string,
    user: User,
  ): Promise<StandardResponse<Subreddit[]>> {
    if (username !== user.username) {
      throw new NotFoundException();
    }

    return this.subredditRepository.findAllByUserId(user.id);
  }

  async getSubredditByName(
    subredditName: string,
  ): Promise<StandardResponse<Subreddit>> {
    return this.subredditRepository.findOne(subredditName);
  }

  async createSubreddit(
    userId: string,
    createSubredditDto: CreateSubredditDto,
    avatar: Express.Multer.File,
  ): Promise<StandardResponse<Subreddit>> {
    try {
      return await this.subredditRepository.create(
        userId,
        createSubredditDto,
        avatar,
      );
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
    await this.subredditRepository.hasPermission(userId, { id: subredditId });

    try {
      return await this.subredditRepository.update(
        subredditId,
        updateSubredditDto,
      );
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
    await this.subredditRepository.hasPermission(userId, { id: subredditId });

    const data = await this.subredditRepository.delete(subredditId);

    if (data) return data;

    throw new BadGatewayException(
      `Failed to delete subreddit with id ${subredditId}`,
    );
  }

  async getSubredditMembers(
    subredditId: string,
  ): Promise<StandardResponse<Member[]>> {
    await this.subredditRepository.exists({ id: subredditId });

    return this.subredditRepository.members(subredditId);
  }

  async joinSubreddit(
    subredditId: string,
    userId: string,
  ): Promise<StandardResponse<Member>> {
    await this.subredditRepository.isOwner(subredditId, userId);
    const isMember = await this.subredditRepository.isMember(
      subredditId,
      userId,
    );

    // check if user is already joined the subreddit
    if (isMember) {
      throw new BadRequestException(
        `User is already joined the subreddit with id ${subredditId}`,
      );
    }

    return this.subredditRepository.join(subredditId, userId);
  }

  async leaveSubreddit(
    subredditId: string,
    userId: string,
  ): Promise<StandardResponse<Member>> {
    await this.subredditRepository.isOwner(subredditId, userId);

    const isMember = await this.subredditRepository.isMember(
      subredditId,
      userId,
    );

    // check if user is not member of the subreddit
    if (!isMember) {
      throw new BadRequestException(
        `User is not member of the subreddit with id ${subredditId}`,
      );
    }

    return this.subredditRepository.leave(subredditId, userId);
  }

  async getUserJoinedSubreddits(
    username: string,
    user: User,
  ): Promise<StandardResponse<Subreddit[]>> {
    if (username !== user.username) {
      throw new NotFoundException();
    }

    return this.subredditRepository.joinedSubreddits(user.id);
  }

  async uploadAvatar(
    avatar: Express.Multer.File,
    subredditName: string,
    userId: string,
  ): Promise<StandardResponse<Image>> {
    // Get subreddit by name
    const subreddit = await this.subredditRepository.exists({
      name: subredditName,
    });

    // Check if user is owner of the subreddit
    await this.subredditRepository.hasPermission(userId, { id: subreddit.id });

    // Update subreddit by id
    const { data } = await this.subredditRepository.update(subreddit.id, {
      avatar: `${this.config.get('BASE_URL')}/static/${avatar.filename}`,
    });

    return { success: true, data: { imageUrl: data.avatar } };
  }
}
