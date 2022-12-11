import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post, PostVote, Prisma } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { Vote } from '../../common/types/vote.enum';
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

    return {
      success: true,
      data: posts,
      count: totalPosts,
    };
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
        // TODO: add other related fields e.g comments
      },
      data: {
        userId,
        subredditId,
        ...createPostDto,
        slug,

        // Create media
        medias: medias && {
          createMany: {
            data: medias.map((media) => ({
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
        medias: medias && {
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

  async upvote(
    postId: string,
    userId: string,
  ): Promise<StandardResponse<Post>> {
    // Get user vote from db
    const userVote = await this.hasVoted({
      postId,
      userId,
    });

    /**
     * Code Description:
     *
     * If user has not upvoted the post yet, create one in PostVote and increment upvotes in Post.
     * But if user has upvoted the post before, delete the user PostVote and check it's score.
     * If user score was true (upvote) just decrement upvotes in PostVote.
     * And if user score was false (downvote) create new PostVote, increment upvotes and decrement downvotes by 1 in Post.
     */

    // // ** First approach (it's too complicated !)
    // const createVote = this.prisma.postVote.create({
    //   data: {
    //     postId,
    //     userId,
    //     score: !!Vote.UPVOTE,
    //   },
    // });

    // const postUpvoteIncrement = this.prisma.post.update({
    //   where: {
    //     id: postId,
    //   },
    //   data: {
    //     upvotes: {
    //       increment: 1,
    //     },
    //   },
    // });

    // const postUpvoteDecrement = this.prisma.post.update({
    //   where: {
    //     id: postId,
    //   },
    //   data: {
    //     upvotes: {
    //       decrement: 1,
    //     },
    //   },
    // });

    // const postDownvoteDecrement = this.prisma.post.update({
    //   where: { id: postId },
    //   data: {
    //     downvotes: { decrement: 1 },
    //   },
    // });

    // if (!userVote) {
    //   const [vote, post] = await this.prisma.$transaction([
    //     createVote,
    //     postUpvoteIncrement,
    //   ]);

    //   return { success: true, data: post };
    // }

    // const deletedVote = await this.prisma.postVote.delete({
    //   where: {
    //     id: userVote.id,
    //   },
    // });

    // if (!userVote.score) {
    //   const [vote, , post] = await this.prisma.$transaction([
    //     createVote,
    //     postUpvoteIncrement,
    //     postDownvoteDecrement,
    //   ]);

    //   return { success: true, data: post };
    // }

    // const [post] = await this.prisma.$transaction([postUpvoteDecrement]);

    // return { success: true, data: post };

    // ** Second approach
    const upvotePost = await this.prisma.post.update({
      include: {
        medias: {
          select: {
            mediaUrl: true,
            createdAt: true,
          },
        },
      },
      where: {
        id: postId,
      },
      data: {
        postVotes: userVote
          ? userVote.score
            ? {
                delete: {
                  id: userVote.id,
                },
              }
            : {
                delete: {
                  id: userVote.id,
                },
                create: [
                  {
                    score: !!Vote.UPVOTE,
                    userId,
                  },
                ],
              }
          : {
              create: [
                {
                  score: !!Vote.UPVOTE,
                  userId,
                },
              ],
            },

        upvotes: { increment: userVote?.score ? -1 : 1 },

        downvotes: { increment: userVote && !userVote.score ? -1 : 0 },
      },
    });

    return { success: true, data: upvotePost };
  }

  async downvote(
    postId: string,
    userId: string,
  ): Promise<StandardResponse<Post>> {
    // Get user vote from db
    const userVote = await this.hasVoted({
      postId,
      userId,
    });

    /**
     * Code Description:
     *
     * If user has not downvoted the post yet, create one in PostVote and increment downvotes in Post.
     * But if user has downvoted the post before, delete the user PostVote and check it's score.
     * If user score was false (downvote) just decrement downvotes in PostVote.
     * And if user score was true (upvote) create new PostVote, increment downvotes and decrement upvotes by 1 in Post.
     */

    const downvotePost = await this.prisma.post.update({
      include: {
        medias: {
          select: {
            mediaUrl: true,
            createdAt: true,
          },
        },
      },
      where: {
        id: postId,
      },
      data: {
        postVotes: userVote
          ? !userVote.score
            ? {
                delete: {
                  id: userVote.id,
                },
              }
            : {
                delete: {
                  id: userVote.id,
                },
                create: [
                  {
                    score: !!Vote.DOWNVOTE,
                    userId,
                  },
                ],
              }
          : {
              create: [
                {
                  score: !!Vote.DOWNVOTE,
                  userId,
                },
              ],
            },

        downvotes: { increment: userVote && !userVote.score ? -1 : 1 },

        upvotes: { increment: userVote?.score ? -1 : 0 },
      },
    });

    return { success: true, data: downvotePost };
  }

  /**
   * Find the user vote from PostVote table and returns it.
   * @param {Prisma.PostVoteWhereInput} Arguments to find user's PostVote.
   * @return {Promise<PostVote>} Returns user's PostVote.
   */
  async hasVoted(where: Prisma.PostVoteWhereInput): Promise<PostVote> {
    const userVote = await this.prisma.postVote.findFirst({
      where,
    });

    return userVote;
  }

  async submitted(username: string): Promise<StandardResponse<Post[]>> {
    const findUserSubmittedPosts = this.prisma.post.findMany({
      include: {
        medias: {
          select: {
            mediaUrl: true,
            createdAt: true,
          },
        },
      },
      where: {
        user: {
          username,
        },
      },
    });

    const countUserSubmittedPosts = this.prisma.post.count({
      where: {
        user: {
          username,
        },
      },
    });

    const [userSubmittedPosts, totalSubmittedPosts] =
      await this.prisma.$transaction([
        findUserSubmittedPosts,
        countUserSubmittedPosts,
      ]);

    return {
      success: true,
      data: userSubmittedPosts,
      count: totalSubmittedPosts,
    };
  }

  async upvoted(username: string): Promise<StandardResponse<Post[]>> {
    const findUserUpvotedPosts = this.prisma.post.findMany({
      include: {
        medias: {
          select: {
            mediaUrl: true,
            createdAt: true,
          },
        },
      },
      where: {
        postVotes: {
          some: {
            user: {
              username,
            },
            score: !!Vote.UPVOTE,
          },
        },
      },
    });

    const countUserUpvotedPosts = this.prisma.post.count({
      where: {
        postVotes: {
          some: {
            user: {
              username,
            },
            score: !!Vote.UPVOTE,
          },
        },
      },
    });

    const [userUpvotedPosts, totalUpvotedPosts] =
      await this.prisma.$transaction([
        findUserUpvotedPosts,
        countUserUpvotedPosts,
      ]);

    return {
      success: true,
      data: userUpvotedPosts,
      count: totalUpvotedPosts,
    };
  }

  async downvoted(username: string): Promise<StandardResponse<Post[]>> {
    const findUserDownvotedPosts = this.prisma.post.findMany({
      include: {
        medias: {
          select: {
            mediaUrl: true,
            createdAt: true,
          },
        },
      },
      where: {
        postVotes: {
          some: {
            user: {
              username,
            },
            score: !!Vote.DOWNVOTE,
          },
        },
      },
    });

    const countUserDownvotedPosts = this.prisma.post.count({
      where: {
        postVotes: {
          some: {
            user: {
              username,
            },
            score: !!Vote.DOWNVOTE,
          },
        },
      },
    });

    const [userDownvotedPosts, totalDownvotedPosts] =
      await this.prisma.$transaction([
        findUserDownvotedPosts,
        countUserDownvotedPosts,
      ]);

    return {
      success: true,
      data: userDownvotedPosts,
      count: totalDownvotedPosts,
    };
  }
}
