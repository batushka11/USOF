import { applyDecorators } from '@nestjs/common'
import {
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse
} from '@nestjs/swagger'
import { LoginDto } from 'src/auth/dto/login.dto'
import { RegisterDto } from 'src/auth/dto/register.dto'

export const ApiLogin = () =>
	applyDecorators(
		ApiOperation({ summary: 'User login' }),
		ApiResponse({
			status: 200,
			description: 'User successfully logged in.',
			schema: {
				example: {
					user: { id: 1, email: 'user@example.com', login: 'user123' },
					accessToken: 'your-access-token'
				}
			}
		}),
		ApiResponse({
			status: 401,
			description: 'Invalid credentials or unconfirmed email.',
			schema: {
				example: { message: 'Invalid credentials' }
			}
		}),
		ApiBody({
			type: LoginDto,
			description: 'User login credentials',
			examples: {
				example: {
					summary: 'Example login',
					value: { login: 'user123', password: 'password123' }
				}
			}
		})
	)

export const ApiRegister = () =>
	applyDecorators(
		ApiOperation({ summary: 'User registration' }),
		ApiResponse({
			status: 201,
			description: 'User successfully registered.',
			schema: {
				example: {
					message:
						'User registered. Please check your email to confirm your account.'
				}
			}
		}),
		ApiResponse({
			status: 400,
			description:
				'User with this email or login already exists, or passwords do not match.',
			schema: {
				example: { message: 'Passwords do not match' }
			}
		}),
		ApiBody({
			type: RegisterDto,
			description: 'User registration details',
			examples: {
				example: {
					summary: 'Example registration',
					value: {
						login: 'user123',
						fullname: 'John Doe',
						email: 'johndoe@example.com',
						password: 'password123',
						password_confirm: 'password123'
					}
				}
			}
		})
	)

export const ApiConfirmEmail = () =>
	applyDecorators(
		ApiOperation({ summary: 'Confirm email address' }),
		ApiResponse({
			status: 200,
			description: 'Email successfully confirmed.',
			schema: {
				example: { message: 'Email confirmed' }
			}
		}),
		ApiResponse({ status: 400, description: 'Invalid token.' }),
		ApiQuery({
			name: 'token',
			type: 'string',
			description: 'Confirmation token for email verification'
		})
	)

export const ApiSendResetPassword = () =>
	applyDecorators(
		ApiOperation({ summary: 'Send password reset email' }),
		ApiResponse({
			status: 200,
			description: 'Password reset email sent.',
			schema: {
				example: { message: 'Reset password email sent' }
			}
		}),
		ApiResponse({
			status: 400,
			description: 'User not found or account not confirmed.',
			schema: {
				example: { message: 'User not found' }
			}
		}),
		ApiBody({
			schema: { example: { email: 'user@example.com' } },
			description: 'User email for password reset'
		})
	)

export const ApiResetPassword = () =>
	applyDecorators(
		ApiOperation({ summary: 'Reset password' }),
		ApiResponse({
			status: 200,
			description: 'Password successfully reset.',
			schema: {
				example: { message: 'Reset password success' }
			}
		}),
		ApiResponse({
			status: 401,
			description: 'Invalid or expired token.',
			schema: {
				example: { message: 'Invalid or expired token' }
			}
		}),
		ApiParam({
			name: 'token',
			type: 'string',
			description: 'Token for password reset'
		}),
		ApiBody({
			schema: { example: { password: 'newPassword123' } },
			description: 'New password'
		})
	)

export const ApiLogout = () =>
	applyDecorators(
		ApiOperation({ summary: 'User logout' }),
		ApiResponse({
			status: 200,
			description: 'User successfully logged out.',
			schema: {
				example: { message: 'Logged out successfully' }
			}
		})
	)

export const ApiRefreshTokens = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Refresh JWT tokens using refresh token from cookie',
			description:
				'Generates new access and refresh tokens if the refresh token in the cookie is valid.'
		}),
		ApiResponse({
			status: 200,
			description: 'New access and refresh tokens generated successfully.',
			schema: {
				example: {
					user: { id: 1, email: 'user@example.com', login: 'user123' },
					accessToken: 'new-access-token'
				}
			}
		}),
		ApiResponse({
			status: 401,
			description: 'Invalid or expired refresh token in cookie.',
			schema: {
				example: { message: 'Invalid or expired refresh token' }
			}
		})
	)
