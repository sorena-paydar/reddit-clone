import { Gender } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    nullable: true,
    example: 'sorena@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    nullable: true,
    example: 'sorena-paydar',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    nullable: true,
    example: '1234',
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    nullable: true,
    example: 'sorena',
  })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({
    nullable: true,
    example: 'software engineer',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    nullable: true,
    example: 'Male',
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    nullable: true,
    type: 'string',
    format: 'binary',
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}
