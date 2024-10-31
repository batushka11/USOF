import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Post,
	Query,
	Req,
	Res,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import {
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { JwtRefreshGuard } from './guards/auth.guard'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	@ApiOperation({ summary: 'User login' })
	@ApiResponse({
		status: 200,
		description: 'User successfully logged in.',
		schema: {
			example: {
				user: { id: 1, email: 'user@example.com', login: 'user123' },
				accessToken: 'your-access-token'
			}
		}
	})
	@ApiResponse({
		status: 401,
		description: 'Invalid credentials or unconfirmed email.'
	})
	@ApiBody({
		type: LoginDto,
		description: 'User login credentials',
		examples: {
			example: {
				summary: 'Example login',
				value: { login: 'user123', password: 'password123' }
			}
		}
	})
	async login(@Body() dto: LoginDto, @Res() res: Response) {
		return this.authService.login(dto, res)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(201)
	@Post('register')
	@ApiOperation({ summary: 'User registration' })
	@ApiResponse({
		status: 201,
		description: 'User successfully registered.',
		schema: {
			example: {
				message:
					'User registered. Please check your email to confirm your account.',
				token: 'confirmation-token'
			}
		}
	})
	@ApiResponse({
		status: 400,
		description:
			'User with this email or login already exists, or passwords do not match.'
	})
	@ApiBody({
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
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Get('register')
	@ApiOperation({ summary: 'Confirm email address' })
	@ApiResponse({
		status: 200,
		description: 'Email successfully confirmed.',
		schema: {
			example: { message: 'Email confirmed' }
		}
	})
	@ApiResponse({ status: 400, description: 'Invalid token.' })
	@ApiQuery({
		name: 'token',
		type: 'string',
		description: 'Confirmation token for email verification'
	})
	async confirmEmail(@Query('token') token: string) {
		return this.authService.confirmEmail(token)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('password-reset')
	@ApiOperation({ summary: 'Send password reset email' })
	@ApiResponse({
		status: 200,
		description: 'Password reset email sent.',
		schema: {
			example: { message: 'Reset password email sent' }
		}
	})
	@ApiResponse({
		status: 400,
		description: 'User not found or account not confirmed.'
	})
	@ApiBody({
		schema: { example: { email: 'user@example.com' } },
		description: 'User email for password reset'
	})
	async sendResetPassword(@Body() body: { email: string }) {
		return this.authService.sendResetPassword(body.email)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('password-reset/:token')
	@ApiOperation({ summary: 'Reset password' })
	@ApiResponse({
		status: 200,
		description: 'Password successfully reset.',
		schema: {
			example: { message: 'Reset password success' }
		}
	})
	@ApiResponse({ status: 401, description: 'Invalid or expired token.' })
	@ApiParam({
		name: 'token',
		type: 'string',
		description: 'Token for password reset'
	})
	@ApiBody({
		schema: { example: { password: 'newPassword123' } },
		description: 'New password'
	})
	async resetPassword(
		@Param('token') token: string,
		@Body() body: { password: string }
	) {
		return this.authService.resetPassword(token, body.password)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('logout')
	@ApiOperation({ summary: 'User logout' })
	@ApiResponse({
		status: 200,
		description: 'User successfully logged out.',
		schema: {
			example: { message: 'Logged out successfully' }
		}
	})
	async logout(@Res() res: Response) {
		return this.authService.logout(res)
	}

	@UsePipes(new ValidationPipe())
	@UseGuards(JwtRefreshGuard)
	@HttpCode(200)
	@Post('refresh')
	@ApiOperation({
		summary: 'Refresh JWT tokens using refresh token from cookie',
		description:
			'Generates new access and refresh tokens if the refresh token in the cookie is valid.'
	})
	@ApiResponse({
		status: 200,
		description: 'New access and refresh tokens generated successfully.',
		schema: {
			example: {
				user: {
					id: 1,
					email: 'user@example.com',
					login: 'user123'
				},
				accessToken: 'new-access-token'
			}
		}
	})
	@ApiResponse({
		status: 401,
		description: 'Invalid or expired refresh token in cookie.'
	})
	async refreshTokens(@Req() req: Request, @Res() res: Response) {
		return this.authService.refreshTokens(req, res)
	}
}
