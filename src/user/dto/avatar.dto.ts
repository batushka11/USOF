import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class AvatarDto {
	@ApiProperty({
		description: 'Path to the avatar image',
		example: '/uploads/avatars/user123.jpg',
		required: true,
		type: String
	})
	@IsNotEmpty()
	@IsString()
	path: string
}
