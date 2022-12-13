import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon from 'argon2';
import { StandardResponse, Token } from '../../common/types/standardResponse';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import { hasWhiteSpace } from '../../common/utils';

@Injectable()
export class AuthRepository {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async create(dto: RegisterDto): Promise<StandardResponse<Token>> {
    // Check if username has whitespace
    if (hasWhiteSpace(dto.username)) {
      throw new BadRequestException('Username must not contain whitespace');
    }

    const hash = await argon.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hash,
      },
    });

    return this.createJWTToken(user.id, user.email);
  }

  async findOne(dto: LoginDto): Promise<StandardResponse<Token>> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) {
      throw new UnauthorizedException('Credentials incorrect');
    }

    return this.createJWTToken(user.id, user.email);
  }

  async createJWTToken(
    userId: string,
    email: string,
  ): Promise<StandardResponse<Token>> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '30d',
      secret,
    });

    return {
      success: true,
      data: { access_token: token },
    };
  }
}
