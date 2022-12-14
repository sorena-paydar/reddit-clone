import { Module } from '@nestjs/common';
import { SubredditRepository } from '../subreddit/subreddit.repository';
import { UserRepository } from '../user/user.repository';
import { PostController } from './post.controller';
import { PostRepository } from './post.repository';
import { PostService } from './post.service';

@Module({
  controllers: [PostController],
  providers: [PostService, PostRepository, SubredditRepository, UserRepository],
})
export class PostModule {}
