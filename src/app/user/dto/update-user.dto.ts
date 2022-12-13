import { Gender } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    required: false,
    example: 'sorena@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    required: false,
    example: 'sorena-paydar',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    required: false,
    example: '1234',
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    required: false,
    example: 'sorena',
  })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({
    required: false,
    example: 'software engineer',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    required: false,
    example: 'Male',
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    required: false,
    type: 'string',
    format: 'binary',
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}
