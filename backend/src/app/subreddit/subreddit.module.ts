import { Module } from '@nestjs/common';
import { SubredditController } from './subreddit.controller';
import { SubredditRepository } from './subreddit.repository';
import { SubredditService } from './subreddit.service';

@Module({
  controllers: [SubredditController],
  providers: [SubredditService, SubredditRepository],
})
export class SubredditModule {}
