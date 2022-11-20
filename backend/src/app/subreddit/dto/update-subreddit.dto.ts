import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubredditDto {
  @ApiProperty({ required: false, example: 'hacking' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    required: false,
    example: 'hacking subreddit',
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
