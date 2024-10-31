import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class RegisterDto {
	@ApiProperty({
		description: 'Username used for login',
		example: 'user123'
	})
	@IsNotEmpty()
	@IsString()
	login: string

	@ApiProperty({
		description: 'Full name of the user',
		example: 'John Doe'
	})
	@IsNotEmpty()
	@IsString()
	fullname: string

	@ApiProperty({
		description: 'User email address',
		example: 'johndoe@example.com'
	})
	@IsNotEmpty()
	@IsEmail()
	email: string

	@ApiProperty({
		description: 'Password with a minimum length of 8 characters',
		example: 'password123',
		minLength: 8
	})
	@IsNotEmpty()
	@MinLength(8, {
		message: 'Password must be at least 8 characters long'
	})
	@IsString()
	password: string

	@ApiProperty({
		description: 'Password confirmation, should match the password',
		example: 'password123'
	})
	@IsNotEmpty()
	@IsString()
	password_confirm: string
}
