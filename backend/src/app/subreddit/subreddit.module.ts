import { Module } from '@nestjs/common';
import { SubredditController } from './subreddit.controller';
import { SubredditService } from './subreddit.service';

@Module({
  controllers: [SubredditController],
  providers: [SubredditService],
})
export class SubredditModule {}
