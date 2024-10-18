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
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { JwtRefreshGuard } from './guards/auth.guard'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(@Body() dto: LoginDto, @Res() res: Response) {
		return this.authService.login(dto, res)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('register')
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Get('register')
	async confirmEmail(@Query('token') token: string) {
		return this.authService.confirmEmail(token)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('password-reset')
	async sendResetPassword(@Body() body: { email: string }) {
		return this.authService.sendResetPassword(body.email)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('password-reset/:token')
	async resetPassword(
		@Param('token') token: string,
		@Body() body: { password: string }
	) {
		return this.authService.resetPassword(token, body.password)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('logout')
	async logout(@Res() res: Response) {
		return this.authService.logout(res)
	}

	@UsePipes(new ValidationPipe())
	@UseGuards(JwtRefreshGuard)
	@HttpCode(200)
	@Post('refresh')
	async refreshTokens(@Req() req: Request, @Res() res: Response) {
		return this.authService.refreshTokens(req, res)
	}
}
