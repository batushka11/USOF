import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from '../../prisma/prisma.service'

interface JwtPayload {
	id: number
	iat: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		private prisma: PrismaService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_SECRET')
		})
	}

	async validate(payload: JwtPayload) {
		const user = await this.prisma.user.findUnique({
			where: { id: payload.id }
		})

		if (!user) {
			throw new UnauthorizedException('User not found')
		}

		const tokenIssuedAt = new Date(payload.iat * 1000)

		if (user.lastLogout && tokenIssuedAt < user.lastLogout) {
			throw new UnauthorizedException('User is logged out')
		}

		await this.prisma.user.update({
			where: { id: payload.id },
			data: { lastActive: new Date() }
		})

		return user
	}
}
