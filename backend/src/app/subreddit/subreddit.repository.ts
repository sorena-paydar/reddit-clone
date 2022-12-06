import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Member, Prisma, Subreddit } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { hasWhiteSpace } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubredditDto, UpdateSubredditDto } from './dto';

@Injectable()
export class SubredditRepository {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async findAll(): Promise<StandardResponse<Subreddit[]>> {
    // get all subreddits
    const findSubreddits = this.prisma.subreddit.findMany({
      include: {
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    // get number of all subreddits
    const countSubreddits = this.prisma.subreddit.count();

    const [subreddits, totalSubreddits] = await this.prisma.$transaction([
      findSubreddits,
      countSubreddits,
    ]);

    return {
      success: true,
      data: subreddits,
      count: totalSubreddits,
    };
  }

  async findAllByUserId(
    userId: string,
  ): Promise<StandardResponse<Subreddit[]>> {
    // get user's subreddits
    const findSubredditsByUserId = this.prisma.subreddit.findMany({
      where: { userId },
      include: { _count: { select: { members: true, posts: true } } },
    });

    // get number of user's subreddits
    const countSubredditsByUserId = this.prisma.subreddit.count({
      where: {
        user: {
          id: userId,
        },
      },
    });

    const [subreddists, totalSubreddits] = await this.prisma.$transaction([
      findSubredditsByUserId,
      countSubredditsByUserId,
    ]);

    return {
      success: true,
      data: subreddists,
      count: totalSubreddits,
    };
  }

  async findOne(name: string): Promise<StandardResponse<Subreddit>> {
    // find subreddit by name
    const subreddit = await this.exists({ name });

    return { success: true, data: subreddit };
  }

  async create(
    userId: string,
    createSubredditDto: CreateSubredditDto,
    avatar: Express.Multer.File,
  ): Promise<StandardResponse<Subreddit>> {
    // Check if subreddit name has whitespace
    if (hasWhiteSpace(createSubredditDto.name)) {
      throw new BadRequestException(
        'Subreddit name must not contain whitespace',
      );
    }

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
  ): Promise<StandardResponse<Subreddit>> {
    if (hasWhiteSpace(updateSubredditDto.name)) {
      throw new BadRequestException(
        'Subreddit name must not contain whitespace',
      );
    }

    // update subreddit
    const subreddit = await this.prisma.subreddit.update({
      where: {
        id: subredditId,
      },
      data: {
        ...updateSubredditDto,
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
   * Checks whether subreddit with given option exists or not.
   * @param {Prisma.SubredditWhereUniqueInput} where - Subreddit unique field
   * @return {Promise<Subreddit>} return subreddit if it exists
   */
  async exists(where: Prisma.SubredditWhereUniqueInput): Promise<Subreddit> {
    const subreddit = await this.prisma.subreddit.findUnique({ where });

    const { id, name } = where;
    // check if subreddit exists
    if (!subreddit) {
      throw new NotFoundException(
        `Subreddit with ${id ? `id ${id}` : `name ${name}`} was not found`,
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
    const subreddit = await this.exists({ id: subredditId });

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
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
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

  /**
   * Checks whether user is subreddit owner or not.
   * @param {userId} userId - User id
   * @param {Prisma.SubredditWhereUniqueInput} where - Subreddit unique field
   * @return {Promise<Subreddit>} return subreddit.
   */
  async hasPermission(
    userId: string,
    where: Prisma.SubredditWhereUniqueInput,
  ): Promise<Subreddit> {
    // Get subreddit from db by unique inputs if it exists
    const subreddit = await this.exists(where);

    // Check if user the subreddit owner
    if (subreddit.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return subreddit;
  }
}
