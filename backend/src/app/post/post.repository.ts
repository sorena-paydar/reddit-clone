import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { randomString, createSlug } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto';

@Injectable()
export class PostRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(subredditId: string): Promise<StandardResponse<Post[]>> {
    // Get all posts of subreddit with given id
    const data = await this.prisma.post.findMany({ where: { subredditId } });

    // Get posts count
    const count = await this.prisma.post.count({ where: { subredditId } });

    return { success: true, data, count };
  }

  async findOne(
    subredditId: string,
    indentifier: string,
    slug: string,
  ): Promise<StandardResponse<Post>> {
    // Get post with given slug and indentifier
    const data = await this.prisma.post.findFirst({
      where: { slug, indentifier, subredditId },
    });

    // Check if post exists
    if (!data) {
      throw new NotFoundException('Post not found');
    }

    return { success: true, data };
  }

  async create(
    userId: string,
    subredditId: string,
    createPostDto: CreatePostDto,
  ): Promise<StandardResponse<Post>> {
    // Create slug
    const slug = createSlug(
      createPostDto.title,
      {
        replacement: '_',
        remove: /[*+~.()'"!:@]/g,
        lower: true,
      },
      42,
    );

    // Create indentifier
    const indentifier = randomString(6);

    // Create post
    const post = await this.prisma.post.create({
      data: {
        userId,
        subredditId,
        ...createPostDto,
        slug,
        indentifier,
      },
    });

    return { success: true, data: post };
  }
}
