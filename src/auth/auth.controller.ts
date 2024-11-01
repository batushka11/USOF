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
import { ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { JwtRefreshGuard } from './guards/auth.guard'

import {
	ApiConfirmEmail,
	ApiLogin,
	ApiLogout,
	ApiRefreshTokens,
	ApiRegister,
	ApiResetPassword,
	ApiSendResetPassword
} from './docs/auth.swagger'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@ApiLogin()
	@Post('login')
	async login(@Body() dto: LoginDto, @Res() res: Response) {
		return this.authService.login(dto, res)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(201)
	@ApiRegister()
	@Post('register')
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@ApiConfirmEmail()
	@Get('register')
	async confirmEmail(@Query('token') token: string) {
		return this.authService.confirmEmail(token)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@ApiSendResetPassword()
	@Post('password-reset')
	async sendResetPassword(@Body() body: { email: string }) {
		return this.authService.sendResetPassword(body.email)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@ApiResetPassword()
	@Post('password-reset/:token')
	async resetPassword(
		@Param('token') token: string,
		@Body() body: { password: string }
	) {
		return this.authService.resetPassword(token, body.password)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@ApiLogout()
	@Post('logout')
	async logout(@Res() res: Response) {
		return this.authService.logout(res)
	}

	@UsePipes(new ValidationPipe())
	@UseGuards(JwtRefreshGuard)
	@HttpCode(200)
	@ApiRefreshTokens()
	@Post('refresh')
	async refreshTokens(@Req() req: Request, @Res() res: Response) {
		return this.authService.refreshTokens(req, res)
	}
}
