import { IsOptional, IsString } from 'class-validator';

export class CreateSubredditDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
