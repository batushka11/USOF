import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh'
) {
	constructor(
		private configService: ConfigService,
		private prisma: PrismaService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					let data = request?.cookies['refreshToken']
					if (!data) {
						return null
					}
					return data
				}
			]),
			secretOrKey: configService.get('JWT_SECRET'),
			passReqToCallback: true
		})
	}

	async validate(req: Request, payload: { id: number; iat: number }) {
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

		return user
	}
}
