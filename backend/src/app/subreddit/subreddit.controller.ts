import {
  Controller,
  UseGuards,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Subreddit } from '@prisma/client';
import { Public } from '../../common/decorators';
import { StandardResponse } from '../../common/types/standardResponse';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { CreateSubredditDto, UpdateSubredditDto } from './dto';
import { SubredditService } from './subreddit.service';

@UseGuards(JwtGuard)
@Controller('r')
export class SubredditController {
  constructor(private subredditService: SubredditService) {}

  @Get()
  @Public()
  getAllSubreddits(): Promise<StandardResponse<Subreddit[]>> {
    return this.subredditService.getAllSubreddits();
  }

  @Get(':name')
  @Public()
  getSubredditByName(
    @Param('name') name: string,
  ): Promise<StandardResponse<Subreddit>> {
    return this.subredditService.getSubredditByName(name);
  }

  @Post()
  createSubreddit(
    @GetUser('id') userId: string,
    @Body() createSubredditDto: CreateSubredditDto,
  ): Promise<StandardResponse<Subreddit>> {
    return this.subredditService.createSubreddit(userId, createSubredditDto);
  }

  @Patch(':id')
  updateSubredditById(
    @Param('id') subredditId: string,
    @GetUser('id') userId: string,
    @Body() updateSubredditDto: UpdateSubredditDto,
  ): Promise<StandardResponse<Subreddit>> {
    return this.subredditService.updateSubredditById(
      subredditId,
      userId,
      updateSubredditDto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteSubredditById(
    @Param('id') subredditId: string,
    @GetUser('id') userId: string,
  ): Promise<StandardResponse<Subreddit>> {
    return this.subredditService.deleteSubredditById(subredditId, userId);
  }
}
