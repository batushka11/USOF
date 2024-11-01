import { applyDecorators } from '@nestjs/common'
import {
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse
} from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { CreateUserDto } from 'src/user/dto/create-user.dto'
import { UpdateUserDto } from 'src/user/dto/update-user.dto'

export const ApiGetAllUsers = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get all users with pagination' }),
		ApiQuery({
			name: 'page',
			type: Number,
			required: false,
			example: 1,
			description: 'Current page number'
		}),
		ApiQuery({
			name: 'limit',
			type: Number,
			required: false,
			example: 10,
			description: 'Number of users per page'
		}),
		ApiResponse({
			status: 200,
			description: 'Returns a list of users with pagination metadata',
			schema: {
				example: {
					users: [
						{
							id: 1,
							login: 'user1',
							fullname: 'John Doe',
							email: 'john@example.com',
							role: 'USER'
						}
					],
					totalCount: 100,
					page: 1,
					limit: 10,
					totalPages: 10,
					nextPage: 2,
					previousPage: null
				}
			}
		})
	)

export const ApiGetUserById = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get user by ID' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'User ID'
		}),
		ApiResponse({
			status: 200,
			description: 'Returns user details',
			schema: {
				example: {
					id: 1,
					login: 'user1',
					fullname: 'John Doe',
					email: 'john@example.com',
					role: 'USER'
				}
			}
		}),
		ApiResponse({ status: 404, description: 'User not found' })
	)

export const ApiCreateUser = () =>
	applyDecorators(
		ApiOperation({ summary: 'Create a new user' }),
		ApiBody({
			type: CreateUserDto,
			description: 'Data for new user',
			examples: {
				example: {
					summary: 'Example user creation',
					value: {
						login: 'user123',
						fullname: 'John Doe',
						email: 'johndoe@example.com',
						password: 'password123',
						password_confirm: 'password123',
						role: Role.USER
					}
				}
			}
		}),
		ApiResponse({
			status: 201,
			description: 'User successfully created',
			schema: {
				example: {
					id: 2,
					login: 'user123',
					fullname: 'John Doe',
					email: 'johndoe@example.com',
					role: 'USER'
				}
			}
		}),
		ApiResponse({
			status: 409,
			description: 'User with this email or login already exists'
		})
	)

export const ApiUpdateUserAvatar = () =>
	applyDecorators(
		ApiOperation({ summary: 'Update user avatar' }),
		ApiResponse({
			status: 200,
			description: 'Avatar updated successfully',
			schema: {
				example: { id: 1, avatarPath: '/avatars/user1.jpg' }
			}
		}),
		ApiResponse({ status: 404, description: 'User not found' })
	)

export const ApiUpdateUserInfo = () =>
	applyDecorators(
		ApiOperation({ summary: 'Update user information' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'User ID'
		}),
		ApiBody({
			type: UpdateUserDto,
			description: 'Data to update user information',
			examples: {
				example: {
					summary: 'Example user update',
					value: {
						fullname: 'John Smith',
						email: 'johnsmith@example.com'
					}
				}
			}
		}),
		ApiResponse({
			status: 200,
			description: 'User information updated successfully',
			schema: {
				example: {
					id: 1,
					fullname: 'John Smith',
					email: 'johnsmith@example.com'
				}
			}
		}),
		ApiResponse({ status: 403, description: 'Forbidden access' }),
		ApiResponse({ status: 404, description: 'User not found' })
	)

export const ApiDeleteUser = () =>
	applyDecorators(
		ApiOperation({ summary: 'Delete user by ID' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'User ID'
		}),
		ApiResponse({ status: 204, description: 'User deleted successfully' }),
		ApiResponse({ status: 403, description: 'Forbidden access' }),
		ApiResponse({ status: 404, description: 'User not found' })
	)
