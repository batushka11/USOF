import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
	@ApiProperty({
		description: 'User login',
		example: 'user123'
	})
	@IsNotEmpty()
	@IsString()
	login: string

	@ApiProperty({
		description: 'User password',
		example: 'password123'
	})
	@IsNotEmpty()
	@IsString()
	password: string
}
