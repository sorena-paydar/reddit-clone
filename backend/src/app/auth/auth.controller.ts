import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../../common/decorators';
import { StandardResponse, Token } from '../../common/types/standardResponse';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Public()
  register(@Body() dto: RegisterDto): Promise<StandardResponse<Token>> {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  login(@Body() dto: LoginDto): Promise<StandardResponse<Token>> {
    return this.authService.login(dto);
  }
}
