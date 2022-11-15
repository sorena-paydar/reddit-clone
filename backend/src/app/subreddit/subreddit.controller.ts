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
import { Member, Subreddit } from '@prisma/client';
import { Public } from '../../common/decorators';
import { StandardResponse } from '../../common/types/standardResponse';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { CreateSubredditDto, UpdateSubredditDto } from './dto';
import { SubredditService } from './subreddit.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { createSchema } from '../../common/utils';
import {
  AllSubredditMembersExample,
  AllSubredditsExample,
  SingleSubredditExample,
} from './examples';

@ApiBearerAuth()
@ApiTags('Subreddits')
@UseGuards(JwtGuard)
@Controller('r')
export class SubredditController {
  constructor(private subredditService: SubredditService) {}

  @Get()
  @Public()
  @ApiOkResponse({
    schema: createSchema(AllSubredditsExample),
  })
  @ApiOperation({ summary: 'Get all subreddits' })
  getAllSubreddits(): Promise<StandardResponse<Subreddit[]>> {
    return this.subredditService.getAllSubreddits();
  }

  @Get(':name')
  @Public()
  @ApiOkResponse({
    schema: createSchema(SingleSubredditExample),
  })
  @ApiNotFoundResponse({
    description: 'Subreddit not found',
  })
  @ApiOperation({ summary: 'Get subreddit by name' })
  getSubredditByName(
    @Param('name') name: string,
  ): Promise<StandardResponse<Subreddit>> {
    return this.subredditService.getSubredditByName(name);
  }

  @Post()
  @ApiBody({
    type: CreateSubredditDto,
  })
  @ApiCreatedResponse({
    schema: createSchema(SingleSubredditExample),
  })
  @ApiConflictResponse({
    description: '{name} is taken',
  })
  @ApiOperation({ summary: 'Create new subreddit' })
  createSubreddit(
    @GetUser('id') userId: string,
    @Body() createSubredditDto: CreateSubredditDto,
  ): Promise<StandardResponse<Subreddit>> {
    return this.subredditService.createSubreddit(userId, createSubredditDto);
  }

  @Patch(':id')
  @ApiBody({
    type: UpdateSubredditDto,
  })
  @ApiCreatedResponse({
    schema: createSchema(SingleSubredditExample),
  })
  @ApiForbiddenResponse({
    description: 'Access denied',
  })
  @ApiConflictResponse({
    description: '{name} is taken',
  })
  @ApiOperation({ summary: 'Update subreddit by id' })
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
  @ApiNoContentResponse({
    schema: createSchema(SingleSubredditExample),
  })
  @ApiForbiddenResponse({
    description: 'Access denied',
  })
  @ApiNotFoundResponse({
    description: 'Subreddit with id {id} was not found',
  })
  @ApiBadGatewayResponse({
    description: 'Failed to delete subreddit with id {id}',
  })
  @ApiOperation({ summary: 'Delete subreddit by id' })
  deleteSubredditById(
    @Param('id') subredditId: string,
    @GetUser('id') userId: string,
  ): Promise<StandardResponse<Subreddit>> {
    return this.subredditService.deleteSubredditById(subredditId, userId);
  }

  @Get(':id/members')
  @Public()
  @ApiOkResponse({
    schema: createSchema(AllSubredditMembersExample),
  })
  @ApiNotFoundResponse({
    description: 'Subreddit with id {id} was not found',
  })
  @ApiOperation({ summary: 'Get subreddit members' })
  getSubredditMembers(
    @Param('id') subredditId: string,
  ): Promise<StandardResponse<Member[]>> {
    return this.subredditService.getSubredditMembers(subredditId);
  }

  @Post(':id/join')
  @ApiOkResponse({
    schema: createSchema(SingleSubredditExample),
  })
  @ApiNotFoundResponse({
    description: 'Subreddit with id {id} was not found',
  })
  @ApiForbiddenResponse({
    description: 'User is the owner of subreddit with id {id}',
  })
  @ApiBadRequestResponse({
    description: 'User is already joined the subreddit with id {id}',
  })
  @ApiOperation({ summary: 'Join subreddit' })
  joinSubreddit(
    @Param('id') subredditId: string,
    @GetUser('id') userId: string,
  ): Promise<StandardResponse<Member>> {
    return this.subredditService.joinSubreddit(subredditId, userId);
  }

  @Post(':id/leave')
  @ApiOkResponse({
    schema: createSchema(SingleSubredditExample),
  })
  @ApiNotFoundResponse({
    description: 'Subreddit with id {id} was not found',
  })
  @ApiForbiddenResponse({
    description: 'User is the owner of subreddit with id {id}',
  })
  @ApiBadRequestResponse({
    description: 'User is not member of the subreddit with id {id}',
  })
  @ApiOperation({ summary: 'Leave subreddit' })
  leaveSubreddit(
    @Param('id') subredditId: string,
    @GetUser('id') userId: string,
  ): Promise<StandardResponse<Member>> {
    return this.subredditService.leaveSubreddit(subredditId, userId);
  }
}
