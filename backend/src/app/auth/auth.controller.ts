import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../../common/decorators';
import { StandardResponse, Token } from '../../common/types/standardResponse';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import {
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { createSchema } from '../../common/utils';
import { AuthExample } from './examples';

@ApiBearerAuth()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    schema: createSchema(AuthExample),
  })
  @ApiForbiddenResponse({ description: 'Credentials taken' })
  @ApiOperation({ summary: 'Register user' })
  register(@Body() dto: RegisterDto): Promise<StandardResponse<Token>> {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    schema: createSchema(AuthExample),
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Credentials incorrect' })
  @ApiOperation({ summary: 'Login user' })
  login(@Body() dto: LoginDto): Promise<StandardResponse<Token>> {
    return this.authService.login(dto);
  }
}
