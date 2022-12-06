import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post, Prisma } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { createSlug } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto';

@Injectable()
export class PostRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(subredditId: string): Promise<StandardResponse<Post[]>> {
    // Get all posts of subreddit with given id
    const findPosts = this.prisma.post.findMany({
      where: { subredditId },
      include: {
        medias: {
          select: {
            mediaUrl: true,
            createdAt: true,
          },
        },
      },
    });

    // Get posts count
    const countPosts = this.prisma.post.count({ where: { subredditId } });

    const [posts, totalPosts] = await this.prisma.$transaction([
      findPosts,
      countPosts,
    ]);

    return { success: true, data: posts, count: totalPosts };
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
        medias: {
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

        // Create media
        medias: {
          createMany: {
            data: medias?.map((media) => ({
              mediaUrl: `posts/${media.filename}`,
            })),
          },
        },
      },
    });

    return { success: true, data: post };
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

    // Update post
    const post = await this.prisma.post.update({
      include: {
        medias: {
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

        // Update media
        medias: {
          // Delete Previous post media
          deleteMany: {
            postId: postFromDb.id,
          },
          // Create new media
          createMany: {
            data: medias?.map(({ filename }) => ({
              mediaUrl: `posts/${filename}`,
            })),
          },
        },
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
        medias: {
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
