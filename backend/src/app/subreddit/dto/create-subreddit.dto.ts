import { IsOptional, IsString } from 'class-validator';

export class CreateSubredditDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
