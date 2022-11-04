import { IsOptional, IsString } from 'class-validator';

export class UpdateSubredditDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
