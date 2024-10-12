import { MailerService } from '@nestjs-modules/mailer'
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { hash, verify } from 'argon2'
import { PrismaService } from 'src/prisma/prisma.service'
import { v4 } from 'uuid'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private mailerService: MailerService
	) {}

	async login(dto: LoginDto) {
		const user = await this.validateUser(dto)
		const tokens = await this.tokens(user.id)

		return {
			user: this.returnUserFields(user),
			...tokens
		}
	}

	async register(dto: RegisterDto) {
		const oldUserByEmail = await this.prisma.user.findUnique({
			where: {
				email: dto.email
			}
		})

		const oldUserByLogin = await this.prisma.user.findUnique({
			where: {
				login: dto.login
			}
		})

		if (oldUserByEmail)
			throw new BadRequestException('User with this email already exists')
		if (oldUserByLogin)
			throw new BadRequestException('User with this login already exists')
		if (dto.password !== dto.password_confirm)
			throw new BadRequestException('Password must be the same')

		const confirmToken = v4()

		const user = await this.prisma.user.create({
			data: {
				login: dto.login,
				fullname: dto.fullname,
				email: dto.email,
				password: await hash(dto.password),
				confirmToken: confirmToken
			}
		})

		await this.sendConfirmationEmail(user.email, user.confirmToken, user.login)
		return {
			message:
				'User registered. Please check your email to confirm your account.',
			token: confirmToken
		}
	}

	async confirmEmail(token: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				confirmToken: token
			}
		})

		if (!user) throw new BadRequestException('Invalid token')

		await this.prisma.user.update({
			where: { id: user.id },
			data: {
				isConfirm: true,
				confirmToken: null
			}
		})

		return { message: 'Email confirmed' }
	}

	async sendResetPassword(email: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				email: email
			}
		})

		if (!user)
			throw new BadRequestException('User with this email doesn`t exists')

		if (!user.isConfirm)
			throw new ForbiddenException('Account is not confirmed')

		const token = this.jwt.sign(
			{ id: user.id },
			{
				expiresIn: '10m'
			}
		)

		const url = `http://localhost:4200/api/auth/password-reset/${token}`

		await this.mailerService.sendMail({
			to: email,
			subject: 'Password reset',
			template: '../../../src/templates/reset_pwd.hbs',
			context: {
				url: url,
				username: user.login
			}
		})

		await this.prisma.user.update({
			where: { id: user.id },
			data: {
				confirmToken: token
			}
		})

		return { message: 'Reset password email send' }
	}

	async resetPassword(token: string, password: string) {
		try {
			this.jwt.verify(token)

			const user = await this.prisma.user.findUnique({
				where: {
					confirmToken: token
				}
			})

			if (!user)
				throw new BadRequestException('User with this email doesn`t exists')

			if (!user.isConfirm)
				throw new ForbiddenException('Account is not confirmed')

			await this.prisma.user.update({
				where: { id: user.id },
				data: {
					password: await hash(password),
					confirmToken: null
				}
			})

			return { message: 'Reset password success' }
		} catch {
			throw new UnauthorizedException('Token is invalid or has expired')
		}
	}

	private async sendConfirmationEmail(
		email: string,
		token: string,
		username: string
	) {
		const url = `http://localhost:4200/api/auth/register?token=${token}`
		await this.mailerService.sendMail({
			to: email,
			subject: 'Email confirmation',
			template: '../../../src/templates/email.hbs',
			context: {
				url: url,
				username: username
			}
		})
	}

	private async tokens(userId: number) {
		const data = { id: userId }

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		})

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d'
		})

		return { refreshToken, accessToken }
	}

	private returnUserFields(user: User) {
		return {
			id: user.id,
			email: user.email,
			login: user.login
		}
	}

	private async validateUser(dto: LoginDto) {
		const user = await this.prisma.user.findUnique({
			where: {
				login: dto.login
			}
		})

		if (!user) throw new NotFoundException('User not found')

		if (!user.isConfirm)
			throw new UnauthorizedException(
				'Please confirm your email before logging in'
			)

		const isValid = await verify(user.password, dto.password)

		if (!isValid) throw new UnauthorizedException('Invalid password')

		return user
	}
}
