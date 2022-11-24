import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example:
      'Machine Learning Roadmap - a linear learning path to become a Machine Learning Engineer',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'https://journal.media/elimination-of-programmers',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;
}
