import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Media, Post, Prisma } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { createSlug } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto';

@Injectable()
export class PostRepository {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async findAll(subredditId: string): Promise<StandardResponse<Post[]>> {
    // Get all posts of subreddit with given id
    const data = await this.prisma.post.findMany({ where: { subredditId } });

    // Get posts count
    const count = await this.prisma.post.count({ where: { subredditId } });

    return { success: true, data, count };
  }

  async findOne(
    subredditId: string,
    slug: string,
  ): Promise<StandardResponse<Post>> {
    const post = await this.exists({ slug, subredditId });

    return { success: true, data: post };
  }

  async create(
    userId: string,
    subredditId: string,
    createPostDto: CreatePostDto,
    medias: Array<Express.Multer.File>,
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

    // Create post
    const post = await this.prisma.post.create({
      data: {
        userId,
        subredditId,
        ...createPostDto,
        slug,
      },
    });

    // Create media
    await this.prisma.media.createMany({
      data: medias.map(
        ({ filename }) =>
          ({
            postId: post.id,
            mediaUrl: `posts/${filename}`,
          } as Media),
      ),
    });

    return { success: true, data: post };
  }

  async update(
    slug: string,
    updatePostDto: UpdatePostDto,
  ): Promise<StandardResponse<Post>> {
    let newSlug: string;

    // Create new slug if title has been updated
    if (updatePostDto.title)
      newSlug = createSlug(
        updatePostDto.title,
        {
          replacement: '_',
          remove: /[*+~.()'"!:@]/g,
          lower: true,
        },
        42,
      );

    const data = await this.prisma.post.update({
      where: { slug },
      data: {
        ...updatePostDto,
        ...(newSlug && { slug: newSlug }),
      },
    });

    return { success: true, data };
  }

  async delete(subredditId: string): Promise<StandardResponse<Post>> {
    const deletedPost = await this.prisma.post.delete({
      where: { id: subredditId },
    });

    return { success: true, data: deletedPost };
  }

  /**
   * Checks whether post with given option exists or not.
   * @param {Prisma.PostWhereInput} where post field
   * @return {Promise<Post>} return post if it exists
   */
  async exists(where: Prisma.PostWhereInput): Promise<Post> {
    const post = await this.prisma.post.findFirst({
      where,
      include: {
        Media: {
          select: {
            mediaUrl: true,
          },
        },
      },
    });

    // check if post exists
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  /**
   * Checks whether user is post submitter or not.
   * @param {userId} userId - User id
   * @param {Prisma.PostWhereUniqueInput} where - Post unique fields
   * @return {Promise<Subreddit>} return subreddit.
   */
  async isSubmitter(
    userId: string,
    where: Prisma.PostWhereUniqueInput,
  ): Promise<Post> {
    // Get subreddit from db by unique inputs if it exists
    const post = await this.exists(where);

    // Check if user is the post submitter
    if (post.userId !== userId) {
      throw new ForbiddenException('User is not post submitter');
    }

    return post;
  }
}
