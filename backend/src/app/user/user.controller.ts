import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { getUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  @Get(':username')
  me(@getUser() user: User): User {
    return user;
  }
}
