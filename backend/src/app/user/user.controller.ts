import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Subreddit, User } from '@prisma/client';
import { Image, StandardResponse } from '../../common/types/standardResponse';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { SubredditService } from '../subreddit/subreddit.service';
import { UpdateUserDto } from './dto';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiBody,
  ApiForbiddenResponse,
  ApiConsumes,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { SingleUserExample } from './examples';
import { AllUserSubredditsExample } from '../subreddit/examples';
import { ApiFile } from './decorator/api-file.decorator';
import {
  UploadFileInterceptor,
  ParamValidationInterceptor,
} from '../../middleware';
import { diskStorage } from 'multer';
import { getDate, randomString, createSchema } from '../../common/utils';
import * as path from 'path';

@ApiBearerAuth()
@ApiTags('User')
@UseGuards(JwtGuard)
@UseInterceptors(ParamValidationInterceptor)
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private subredditService: SubredditService,
  ) {}

  @Get(':username')
  @ApiOkResponse({
    schema: createSchema(SingleUserExample),
  })
  @ApiNotFoundResponse({
    description: '{username} was not found',
  })
  @ApiOperation({ summary: 'Get user data by username' })
  me(@Param('username') username: string): Promise<StandardResponse<User>> {
    return this.userService.me(username);
  }

  @Patch(':username')
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    schema: createSchema(SingleUserExample),
  })
  @ApiNotFoundResponse({
    description: '{username} was not found',
  })
  @ApiForbiddenResponse({
    description: '{username} is not available',
  })
  @ApiOperation({ summary: 'Update user by username' })
  update(
    @Param('username') username: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<StandardResponse<User>> {
    return this.userService.update(username, updateUserDto);
  }

  @Get(':username/subreddits')
  @ApiOkResponse({
    schema: createSchema(AllUserSubredditsExample),
  })
  @ApiNotFoundResponse({
    description: '{username} was not found',
  })
  @ApiOperation({ summary: 'Get user owned subreddits' })
  subreddits(
    @Param('username') username: string,
    @GetUser() user: User,
  ): Promise<StandardResponse<Subreddit[]>> {
    return this.subredditService.getUserSubreddits(username, user);
  }

  @Get(':username/joined-subreddits')
  @ApiOkResponse({
    schema: createSchema(AllUserSubredditsExample),
  })
  @ApiNotFoundResponse({
    description: '{username} was not found',
  })
  @ApiOperation({ summary: 'Get user joined subreddits' })
  @UseInterceptors(ParamValidationInterceptor)
  joinedSubreddits(
    @Param('username') username: string,
    @GetUser() user: User,
  ): Promise<StandardResponse<Subreddit[]>> {
    return this.subredditService.getUserJoinedSubreddits(username, user);
  }

  @Post(':username/upload-avatar')
  @ApiConsumes('multipart/form-data')
  @ApiFile('avatar')
  @ApiOkResponse({
    description: 'User avatar',
  })
  @ApiBadRequestResponse({
    description: 'File format is not valid',
  })
  @ApiNotFoundResponse({
    description: '{username} was not found',
  })
  @ApiOperation({ summary: 'Upload user avatar' })
  @UseInterceptors(
    /**
     * The `options` is a now function executed on intercept.
     * This function receives the context parameter allowing you
     * to use get the request and subsequentially the parameters
     */
    UploadFileInterceptor('avatar', (ctx) => {
      // Get request from Context
      const req = ctx.switchToHttp().getRequest() as Request & {
        params: {
          username: string;
        };
      };

      // Return the options
      return {
        storage: diskStorage({
          destination: './media',

          filename: (_req, file, cb) => {
            const fileExtension = path.extname(file.originalname);

            return cb(
              null,
              `${req.params.username}_${getDate()}_${randomString(
                16,
              )}${fileExtension}`,
            );
          },
        }),
        fileFilter: (_req, file, cb) => {
          // Check file mime-type
          if (!Boolean(file.mimetype.match(/(jpg|jpeg|png)/)))
            return cb(
              new BadRequestException('File format is not valid'),
              false,
            );

          return cb(null, true);
        },
      };
    }),
  )
  uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    avatar: Express.Multer.File,
    @Param('username') username: string,
  ): Promise<StandardResponse<Image>> {
    return this.userService.uploadAvatar(avatar, username);
  }

  @Post(':username/remove-avatar')
  @ApiOkResponse({
    schema: createSchema(SingleUserExample),
  })
  @ApiNotFoundResponse({
    description: '{username} was not found',
  })
  @ApiForbiddenResponse({
    description: '{username} is not available',
  })
  @ApiOperation({ summary: 'Remove user avatar by username' })
  removeAvatar(
    @Param('username') username: string,
  ): Promise<StandardResponse<User>> {
    return this.userService.update(username, { avatar: null });
  }
}
