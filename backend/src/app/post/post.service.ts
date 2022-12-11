import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Post } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { SubredditRepository } from '../subreddit/subreddit.repository';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
  constructor(
    private postRepository: PostRepository,
    private subredditRepository: SubredditRepository,
  ) {}

  async getAllPosts(subredditName: string): Promise<StandardResponse<Post[]>> {
    // Get subreddit with given name
    const subreddit = await this.subredditRepository.exists({
      name: subredditName,
    });

    return this.postRepository.findAll(subreddit.id);
  }

  async getPostDetailBySlug(
    subredditName: string,
    slug: string,
  ): Promise<StandardResponse<Post>> {
    // Get subreddit with given name
    const subreddit = await this.subredditRepository.exists({
      name: subredditName,
    });

    return this.postRepository.findOne(subreddit.id, slug);
  }

  async createPost(
    subredditName: string,
    userId: string,
    createPostDto: CreatePostDto,
    medias: Array<Express.Multer.File>,
  ) {
    // Get subreddit with given name
    const subreddit = await this.subredditRepository.exists({
      name: subredditName,
    });

    // Check if user is either member or owner of the subreddit
    const isMember = await this.subredditRepository.isMember(
      subreddit.id,
      userId,
    );

    if (!isMember) {
      throw new BadRequestException(
        `User is not member of the subreddit r/${subreddit.name}`,
      );
    }

    return this.postRepository.create(
      userId,
      subreddit.id,
      createPostDto,
      medias,
    );
  }

  async updatePostBySlug(
    userId: string,
    subredditName: string,
    slug: string,
    updatePostDto: UpdatePostDto,
    medias: Array<Express.Multer.File>,
  ): Promise<StandardResponse<Post>> {
    // Get surbeddit by name
    const subreddit = await this.subredditRepository.exists({
      name: subredditName,
    });

    // Check if post exists in the subreddit with given id or belongs to another subreddit
    const post = await this.postRepository.exists({
      slug,
      subredditId: subreddit.id,
    });

    // Check if user is submitter of the post
    if (userId !== post.userId) {
      throw new ForbiddenException('User is not the post submitter');
    }

    return this.postRepository.update(slug, updatePostDto, medias);
  }

  async upvotePostById(
    subredditName: string,
    postId: string,
    userId: string,
  ): Promise<StandardResponse<Post>> {
    await this.subredditRepository.exists({
      name: subredditName,
    });

    await this.postRepository.exists({ id: postId });

    return this.postRepository.upvote(postId, userId);
  }

  async downvotePostById(
    subredditName: string,
    postId: string,
    userId: string,
  ): Promise<StandardResponse<Post>> {
    await this.subredditRepository.exists({
      name: subredditName,
    });

    await this.postRepository.exists({ id: postId });

    return this.postRepository.downvote(postId, userId);
  }

  async deletePostById(
    postId: string,
    userId: string,
  ): Promise<StandardResponse<Post>> {
    // Check if user is post submitter or not
    await this.postRepository.isSubmitter(userId, { id: postId });

    // Delete post
    const data = await this.postRepository.delete(postId);

    if (data) return data;

    throw new BadGatewayException(`Failed to delete post with id ${postId}`);
  }
}
