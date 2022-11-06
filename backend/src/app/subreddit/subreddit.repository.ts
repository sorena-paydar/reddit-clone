import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Subreddit } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubredditDto, UpdateSubredditDto } from './dto';

@Injectable()
export class SubredditRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<StandardResponse<Subreddit[]>> {
    // get all subreddits
    const data = await this.prisma.subreddit.findMany();

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
  ): Promise<StandardResponse<Subreddit>> {
    // create subreddit
    const subreddit = await this.prisma.subreddit.create({
      data: {
        userId,
        ...createSubredditDto,
      },
    });

    return { success: true, data: subreddit };
  }

  async update(
    subredditId: string,
    userId: string,
    updateSubredditDto: UpdateSubredditDto,
  ): Promise<StandardResponse<Subreddit>> {
    // get subreddit from db by id
    const subredditFromDb = await this.prisma.subreddit.findUnique({
      where: { id: subredditId },
    });

    if (!subredditFromDb) {
      throw new NotFoundException('Subreddit not found');
    }

    if (subredditFromDb.userId !== userId) {
      throw new ForbiddenException('Access denied');
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

  async delete(
    subredditId: string,
    userId: string,
  ): Promise<StandardResponse<Subreddit>> {
    // get subreddit from db by id
    const subredditFromDb = await this.exists(subredditId);

    if (subredditFromDb.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

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

  /**
   * Checks whether subreddit with given name exists or not.
   * @param {subredditName} subredditName subreddit name
   * @return {Promise<Subreddit>} return subreddit if it exists
   */
  async existsByName(subredditId: string) {
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
}
