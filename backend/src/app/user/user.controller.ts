import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { SubredditService } from '../subreddit/subreddit.service';
import { UpdateUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private subredditService: SubredditService,
  ) {}

  @Get(':username')
  me(
    @Param('username') username: string,
    @GetUser() user: User,
  ): Promise<User> {
    return this.userService.me(username, user);
  }

  @Patch(':username')
  update(
    @Param('username') username: string,
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(username, user, updateUserDto);
  }

  @Get(':username/subreddits')
  subreddits(@Param('username') username: string, @GetUser() user: User) {
    return this.subredditService.findUserSubreddits(username, user);
  }
}
