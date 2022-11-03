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
import { Public } from '../../common/decorators';
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
  findAll() {
    return this.subredditService.findAll();
  }

  @Get(':name')
  @Public()
  findOne(@Param('name') name: string) {
    return this.subredditService.findOne(name);
  }

  @Post()
  create(
    @GetUser('id') userId: string,
    @Body() createSubredditDto: CreateSubredditDto,
  ) {
    return this.subredditService.create(userId, createSubredditDto);
  }

  @Patch(':id')
  update(
    @Param('id') subredditId: string,
    @GetUser('id') userId: string,
    @Body() updateSubredditDto: UpdateSubredditDto,
  ) {
    return this.subredditService.update(
      subredditId,
      userId,
      updateSubredditDto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  delete(@Param('id') subredditId: string, @GetUser('id') userId: string) {
    return this.subredditService.delete(subredditId, userId);
  }
}
