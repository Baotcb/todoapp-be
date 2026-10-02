import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTodoDto {
    @ApiProperty({
        example: 'Học NestJS',
    })
    title: string;

    @ApiPropertyOptional({
        example: false,
        default: false,
    })
    completed?: boolean;
}
