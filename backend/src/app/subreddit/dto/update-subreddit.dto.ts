import { IsOptional, IsString } from 'class-validator';

export class UpdateSubredditDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
