import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubredditDto {
  @ApiProperty({
    example: 'programming',
  })
  @IsString()
  name: string;

  @ApiProperty({
    required: false,
    example: 'Computer Programming',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    required: false,
    type: 'string',
    format: 'binary',
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}
