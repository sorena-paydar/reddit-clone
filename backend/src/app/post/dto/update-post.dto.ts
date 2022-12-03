import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({ required: false, example: 'Elimination of programmers' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    required: false,
    example: 'https://journal.media/elimination-of-programmers',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    required: false,
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @IsString()
  @IsOptional()
  medias?: {
    type: 'string';
    format: 'binary';
  }[];
}
