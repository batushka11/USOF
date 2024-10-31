import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class UpdateCommentDto {
	@ApiProperty({
		description: 'I really like this post.',
		example: 'This is an updated comment content.'
	})
	@IsString()
	content: string
}
