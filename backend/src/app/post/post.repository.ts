import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Media, Post, Prisma } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { createSlug } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto';

@Injectable()
export class PostRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(subredditId: string): Promise<StandardResponse<Post[]>> {
    // Get all posts of subreddit with given id
    const data = await this.prisma.post.findMany({
      where: { subredditId },
      include: {
        Media: {
          select: {
            mediaUrl: true,
            createdAt: true,
          },
        },
      },
    });

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
      include: {
        Media: {
          select: {
            mediaUrl: true,
            createdAt: true,
          },
        },
        // TODO: add other related fields e.g votes and comments
      },
      data: {
        userId,
        subredditId,
        ...createPostDto,
        slug,
      },
    });

    // Create media
    if (medias)
      await this.prisma.media.createMany({
        data: medias?.map(
          ({ filename }) =>
            ({
              postId: post.id,
              mediaUrl: `posts/${filename}`,
            } as Media),
        ),
      });

    // Find and return the created post
    return await this.findOne(subredditId, slug);
  }

  async update(
    slug: string,
    updatePostDto: UpdatePostDto,
    medias: Array<Express.Multer.File>,
  ): Promise<StandardResponse<Post>> {
    // Get post by slug
    const postFromDb = await this.exists({ slug });

    // Create new slug if title has been updated
    let newSlug: string;

    if (updatePostDto.title !== postFromDb.title)
      newSlug = createSlug(
        updatePostDto.title,
        {
          replacement: '_',
          remove: /[*+~.()'"!:@]/g,
          lower: true,
        },
        42,
      );

    // Delete previous post media
    await this.prisma.media.deleteMany({
      where: { postId: postFromDb.id },
    });

    // Create new media
    if (medias)
      await this.prisma.media.createMany({
        data: medias?.map(
          ({ filename }) =>
            ({
              postId: postFromDb.id,
              mediaUrl: `posts/${filename}`,
            } as Media),
        ),
      });

    // Update post
    const post = await this.prisma.post.update({
      include: {
        Media: {
          select: {
            mediaUrl: true,
            createdAt: true,
          },
        },
        // TODO: add other related fields e.g votes and comments
      },
      where: { slug },
      data: {
        ...updatePostDto,
        ...(newSlug && { slug: newSlug }),
      },
    });

    return { success: true, data: post };
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
            createdAt: true,
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
