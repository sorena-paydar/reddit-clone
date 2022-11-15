import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Subreddit, User } from '@prisma/client';
import { StandardResponse } from '../../common/types/standardResponse';
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
} from '@nestjs/swagger';
import { createSchema } from '../../common/utils';
import { SingleUserExample } from './examples';
import { AllUserSubredditsExample } from '../subreddit/examples';

@ApiBearerAuth()
@ApiTags('User')
@UseGuards(JwtGuard)
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
  me(
    @Param('username') username: string,
    @GetUser() user: User,
  ): Promise<StandardResponse<User>> {
    return this.userService.me(username, user);
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
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<StandardResponse<User>> {
    return this.userService.update(username, user, updateUserDto);
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
  joinedSubreddits(
    @Param('username') username: string,
    @GetUser() user: User,
  ): Promise<StandardResponse<Subreddit[]>> {
    return this.subredditService.getUserJoinedSubreddits(username, user);
  }
}
