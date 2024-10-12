import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Post,
	Query,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(@Body() dto: LoginDto) {
		return this.authService.login(dto)
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
}
