import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubredditDto {
  @ApiProperty({
    example: 'programming',
  })
  @IsString()
  name: string;

  @ApiProperty({
    nullable: true,
    example: 'Computer Programming',
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
