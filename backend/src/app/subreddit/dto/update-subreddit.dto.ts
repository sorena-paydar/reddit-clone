import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubredditDto {
  @ApiProperty({
    nullable: true,
    example: 'hacking',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    nullable: true,
    example: 'hacking subreddit',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    nullable: true,
    example: null,
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}
