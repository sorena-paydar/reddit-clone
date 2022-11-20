import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Member, Subreddit } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubredditDto, UpdateSubredditDto } from './dto';

@Injectable()
export class SubredditRepository {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async findAll(): Promise<StandardResponse<Subreddit[]>> {
    // get all subreddits
    const data = await this.prisma.subreddit.findMany({
      include: {
        _count: {
          select: {
            Members: true,
          },
        },
      },
    });

    // get number of all subreddits
    const count = await this.prisma.subreddit.count();

    return {
      success: true,
      data,
      count,
    };
  }

  async findAllByUserId(
    userId: string,
  ): Promise<StandardResponse<Subreddit[]>> {
    // get user's subreddits
    const data = await this.prisma.subreddit.findMany({
      where: { userId },
      include: { _count: { select: { Members: true } } },
    });

    // get number of user's subreddits
    const count = await this.prisma.subreddit.count({
      where: {
        user: {
          id: userId,
        },
      },
    });

    return {
      success: true,
      data,
      count,
    };
  }

  async findOne(name: string): Promise<StandardResponse<Subreddit>> {
    // find subreddit by name
    const subreddit = await this.prisma.subreddit.findFirst({
      where: {
        name,
      },
    });

    if (!subreddit) {
      throw new NotFoundException(`Subreddit not found`);
    }

    return { success: true, data: subreddit };
  }

  async create(
    userId: string,
    createSubredditDto: CreateSubredditDto,
    avatar: Express.Multer.File,
  ): Promise<StandardResponse<Subreddit>> {
    // Check if avatar is null
    const subredditAvatar = avatar
      ? `${this.config.get('BASE_URL')}/static/${avatar.filename}`
      : null;

    // create subreddit
    const subreddit = await this.prisma.subreddit.create({
      data: {
        userId,
        ...createSubredditDto,
        avatar: subredditAvatar,
      },
    });

    // add owner to member tabel
    await this.prisma.member.create({
      data: { userId, subredditId: subreddit.id },
    });

    return { success: true, data: subreddit };
  }

  async update(
    subredditId: string,
    updateSubredditDto: UpdateSubredditDto,
    avatar: Express.Multer.File,
  ): Promise<StandardResponse<Subreddit>> {
    // Check if avatar is null
    const subredditAvatar = avatar
      ? `${this.config.get('BASE_URL')}/static/${avatar.filename}`
      : null;

    // update subreddit
    const subreddit = await this.prisma.subreddit.update({
      where: {
        id: subredditId,
      },
      data: {
        ...updateSubredditDto,
        avatar: subredditAvatar,
      },
    });

    return { success: true, data: subreddit };
  }

  async delete(subredditId: string): Promise<StandardResponse<Subreddit>> {
    const deletedSubreddit = await this.prisma.subreddit.delete({
      where: { id: subredditId },
    });

    return { success: true, data: deletedSubreddit };
  }

  /**
   * Checks whether subreddit with given id exists or not.
   * @param {subredditId} subredditId subreddit id
   * @return {Promise<Subreddit>} return subreddit if it exists
   */
  async exists(subredditId: string) {
    const subreddit = await this.prisma.subreddit.findUnique({
      where: { id: subredditId },
    });

    // check if subreddit exists
    if (!subreddit) {
      throw new NotFoundException(
        `Subreddit with id ${subredditId} was not found`,
      );
    }

    return subreddit;
  }

  async members(subredditId: string): Promise<StandardResponse<Member[]>> {
    // get all subreddit members
    const members = await this.prisma.member.findMany({
      where: {
        subredditId,
      },
    });

    return {
      success: true,
      data: members,
      count: members.length,
    };
  }

  async join(
    subredditId: string,
    userId: string,
  ): Promise<StandardResponse<Member>> {
    const data = await this.prisma.member.create({
      data: {
        subredditId,
        userId,
      },
    });

    return {
      success: true,
      data,
    };
  }

  async leave(
    subredditId: string,
    userId: string,
  ): Promise<StandardResponse<Member>> {
    // find member id by subreddit id and user id
    const { id } = await this.prisma.member.findFirst({
      where: { subredditId, userId },
    });

    // delete member row by id
    const data = await this.prisma.member.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      data,
    };
  }

  /**
   * Checks whether user is the subreddit owner or not.
   * @param {subredditId} subredditId subreddit id
   * @param {userId} userId user id
   * @return {Promise<void>} throw exception if user is the subreddit owner.
   */
  async isOwner(subredditId: string, userId: string): Promise<void> {
    const subreddit = await this.exists(subredditId);

    // check if user is the owner
    if (subreddit.userId === userId) {
      throw new ForbiddenException(
        `User is the owner of subreddit with id ${subredditId}`,
      );
    }
  }

  /**
   * Checks whether user is joined the subreddit or not.
   * @param {subredditId} subredditId subreddit id
   * @param {userId} userId user id
   * @return {Promise<Member>} return member if user is joined the subreddit or null.
   */
  async isMember(subredditId: string, userId: string): Promise<Member> {
    return await this.prisma.member.findFirst({
      where: { subredditId, userId },
    });
  }

  async joinedSubreddits(
    userId: string,
  ): Promise<StandardResponse<Subreddit[]>> {
    const data = await this.prisma.subreddit.findMany({
      where: {
        Members: {
          some: {
            userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            Members: true,
          },
        },
      },
    });

    return {
      success: true,
      data,
      count: data.length,
    };
  }
}
