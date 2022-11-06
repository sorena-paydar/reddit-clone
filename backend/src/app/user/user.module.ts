import { Module } from '@nestjs/common';
import { SubredditRepository } from '../subreddit/subreddit.repository';
import { SubredditService } from '../subreddit/subreddit.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    SubredditService,
    UserRepository,
    SubredditRepository,
  ],
})
export class UserModule {}
