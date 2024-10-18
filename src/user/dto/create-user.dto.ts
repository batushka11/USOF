import { Role } from '@prisma/client'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
	@IsNotEmpty()
	@IsString()
	login: string

	@IsNotEmpty()
	@IsString()
	fullname: string

	@IsNotEmpty()
	@IsEmail()
	email: string

	@IsNotEmpty()
	@MinLength(8, {
		message: 'Password must be at least 8 characters long'
	})
	@IsString()
	password: string

	password_confirm: string

	@IsNotEmpty()
	role: Role
}
