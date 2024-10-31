import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { User } from '@prisma/client'
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

	async validate(req: Request, { id }: Pick<User, 'id'>) {
		const user = await this.prisma.user.findUnique({ where: { id: +id } })

		if (!user) {
			return null
		}

		return user
	}
}
