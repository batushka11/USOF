import { ApiProperty } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
	@ApiProperty({
		description: 'Unique login for the user',
		example: 'user123',
		required: true,
		type: String
	})
	@IsNotEmpty()
	@IsString()
	login: string

	@ApiProperty({
		description: 'Full name of the user',
		example: 'John Doe',
		required: true,
		type: String
	})
	@IsNotEmpty()
	@IsString()
	fullname: string

	@ApiProperty({
		description: 'Email address of the user',
		example: 'johndoe@example.com',
		required: true,
		type: String
	})
	@IsNotEmpty()
	@IsEmail()
	email: string

	@ApiProperty({
		description:
			'Password for the user account (must be at least 8 characters)',
		example: 'securePassword123',
		required: true,
		type: String,
		minLength: 8
	})
	@IsNotEmpty()
	@MinLength(8, {
		message: 'Password must be at least 8 characters long'
	})
	@IsString()
	password: string

	@ApiProperty({
		description: 'Confirmation of the password',
		example: 'securePassword123',
		required: true,
		type: String
	})
	password_confirm: string

	@ApiProperty({
		description: 'Role assigned to the user',
		example: Role.USER,
		required: true,
		enum: Role
	})
	@IsNotEmpty()
	role: Role
}
