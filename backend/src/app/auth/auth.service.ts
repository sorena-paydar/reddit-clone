import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { StandardResponse, Token } from '../../common/types/standardResponse';
import { AuthRepository } from './auth.repository';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private repository: AuthRepository) {}

  async register(dto: RegisterDto): Promise<StandardResponse<Token>> {
    try {
      return await this.repository.create(dto);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }

      throw error;
    }
  }

  async login(dto: LoginDto): Promise<StandardResponse<Token>> {
    return this.repository.findOne(dto);
  }
}
