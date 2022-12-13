import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { Auth, GetUser } from '../auth/decorator';
import { PostService } from './post.service';
import Prisma from '@prisma/client';
import { CreatePostDto, UpdatePostDto } from './dto';
import { createSchema, getDate, randomString } from '../../common/utils';
import { StandardResponse } from '../../common/types/standardResponse';
import { AllPostsExample, SinglePostExample } from './examples';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UploadMultiFileInterceptor } from '../../middleware';

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

  @Get('comments/:slug')
  @Public()
  @ApiOkResponse({
    schema: createSchema(SinglePostExample),
  })
  @ApiNotFoundResponse({
    description: 'Post not found',
  })
  @ApiOperation({
    summary: 'Get post detail by slug',
  })
  getPostDetailBySlug(
    @Param('subredditName') subredditName: string,
    @Param('slug') slug: string,
  ): Promise<StandardResponse<Prisma.Post>> {
    return this.postService.getPostDetailBySlug(subredditName, slug);
  }

  @Post('submit')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreatePostDto,
  })
  @ApiCreatedResponse({
    schema: createSchema(SinglePostExample),
  })
  @ApiBadRequestResponse({
    description: 'User is not member of the subreddit r/{subredditName}',
  })
  @ApiNotFoundResponse({
    description: 'Subreddit with name {subredditName} was not found',
  })
  @ApiOperation({
    summary: 'Create a new post',
  })
  @UseInterceptors(
    UploadMultiFileInterceptor('medias', 10, () => {
      // Return the options
      return {
        storage: diskStorage({
          destination: './media/posts',

          filename: (_req, file, cb) => {
            const fileExtension = path.extname(file.originalname);

            return cb(null, `${getDate()}_${randomString(16)}${fileExtension}`);
          },
        }),
      };
    }),
  )
  createPost(
    @Param('subredditName') subredditName: string,
    @GetUser('id') userId: string,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() medias: Array<Express.Multer.File>,
  ) {
    return this.postService.createPost(
      subredditName,
      userId,
      createPostDto,
      medias,
    );
  }

  @Patch('comments/:slug')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdatePostDto,
  })
  @ApiOkResponse({
    schema: createSchema(SinglePostExample),
  })
  @ApiNotFoundResponse({
    description: 'Post not found',
  })
  @ApiForbiddenResponse({
    description: 'User is not post submitter',
  })
  @ApiOperation({
    summary: 'Update post by slug',
  })
  @UseInterceptors(
    UploadMultiFileInterceptor('medias', 10, () => {
      // Return the options
      return {
        storage: diskStorage({
          destination: './media/posts',

          filename: (_req, file, cb) => {
            const fileExtension = path.extname(file.originalname);

            return cb(null, `${getDate()}_${randomString(16)}${fileExtension}`);
          },
        }),
      };
    }),
  )
  updatePostBySlug(
    @Param('subredditName') subredditName: string,
    @GetUser('id') userId: string,
    @Param('slug') slug: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() medias: Array<Express.Multer.File>,
  ): Promise<StandardResponse<Prisma.Post>> {
    return this.postService.updatePostBySlug(
      userId,
      subredditName,
      slug,
      updatePostDto,
      medias,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('comments/:id/upvote')
  @ApiOkResponse({
    schema: createSchema(SinglePostExample),
  })
  @ApiNotFoundResponse({
    description: 'Post not found',
  })
  @ApiOperation({ summary: 'Upvote post' })
  upvotePostById(
    @Param('subredditName') subredditName: string,
    @Param('id') postId: string,
    @GetUser('id') userId: string,
  ): Promise<StandardResponse<Prisma.Post>> {
    return this.postService.upvotePostById(subredditName, postId, userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('comments/:id/downvote')
  @ApiOkResponse({
    schema: createSchema(SinglePostExample),
  })
  @ApiNotFoundResponse({
    description: 'Post not found',
  })
  @ApiOperation({ summary: 'Downvote post' })
  downvotePostById(
    @Param('subredditName') subredditName: string,
    @Param('id') postId: string,
    @GetUser('id') userId: string,
  ): Promise<StandardResponse<Prisma.Post>> {
    return this.postService.downvotePostById(subredditName, postId, userId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('post/:id')
  @ApiNoContentResponse({ description: 'No Content' })
  @ApiForbiddenResponse({
    description: 'User is not post submitter',
  })
  @ApiNotFoundResponse({
    description: 'Post with id {id} was not found',
  })
  @ApiBadGatewayResponse({
    description: 'Failed to delete post with id {id}',
  })
  @ApiOperation({ summary: 'Delete post by id' })
  deletePostById(
    @Param('id') postId: string,
    @GetUser('id') userId: string,
  ): Promise<StandardResponse<Prisma.Post>> {
    return this.postService.deletePostById(postId, userId);
  }
}
