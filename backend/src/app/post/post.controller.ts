import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { Auth, GetUser } from '../auth/decorator';
import { PostService } from './post.service';
import Prisma from '@prisma/client';
import { CreatePostDto } from './dto';
import { createSchema } from '../../common/utils';
import { StandardResponse } from '../../common/types/standardResponse';
import { AllPostsExample, SinglePostExample } from './examples';

@Auth()
@ApiTags('Posts')
@Controller('r/:subredditName')
export class PostController {
  constructor(private postService: PostService) {}

  @Get('posts')
  @Public()
  @ApiOkResponse({
    schema: createSchema(AllPostsExample),
  })
  @ApiNotFoundResponse({
    description: 'Subreddit with name {subredditName} was not found',
  })
  @ApiOperation({
    summary: "Get all subreddit's posts",
  })
  getAllPosts(
    @Param('subredditName') subredditName: string,
  ): Promise<StandardResponse<Prisma.Post[]>> {
    return this.postService.getAllPosts(subredditName);
  }

  @Get('comments/:indentifier/:slug')
  @Public()
  @ApiOkResponse({
    schema: createSchema(SinglePostExample),
  })
  @ApiNotFoundResponse({
    description: 'Post not found',
  })
  @ApiOperation({
    summary: 'Get post detail',
  })
  getPostDetail(
    @Param('subredditName') subredditName: string,
    @Param('indentifier') indentifier: string,
    @Param('slug') slug: string,
  ): Promise<StandardResponse<Prisma.Post>> {
    return this.postService.getPostDetail(subredditName, indentifier, slug);
  }

  @Post('submit')
  @ApiBody({
    type: CreatePostDto,
  })
  @ApiCreatedResponse({
    schema: createSchema(SinglePostExample),
  })
  @ApiNotFoundResponse({
    description: 'Subreddit with name {subredditName} was not found',
  })
  @ApiOperation({
    summary: 'Create a new post',
  })
  createPost(
    @Param('subredditName') subredditName: string,
    @GetUser('id') userId: string,
    @Body() createPostDto: CreatePostDto,
  ): Promise<StandardResponse<Prisma.Post>> {
    return this.postService.createPost(subredditName, userId, createPostDto);
  }
}
