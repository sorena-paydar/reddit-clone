import { Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
import { SubredditRepository } from '../subreddit/subreddit.repository';
import { CreatePostDto } from './dto';
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

  async getPostDetail(
    subredditName: string,
    indentifier: string,
    slug: string,
  ): Promise<StandardResponse<Post>> {
    // Get subreddit with given name
    const subreddit = await this.subredditRepository.exists({
      name: subredditName,
    });

    return this.postRepository.findOne(subreddit.id, indentifier, slug);
  }

  async createPost(
    subredditName: string,
    userId: string,
    createPostDto: CreatePostDto,
  ): Promise<StandardResponse<Post>> {
    // Get subreddit with given name
    const subreddit = await this.subredditRepository.exists({
      name: subredditName,
    });

    return this.postRepository.create(userId, subreddit.id, createPostDto);
  }
}
