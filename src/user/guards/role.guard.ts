import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from 'src/prisma/prisma.service'
import { ROLES_KEY } from '../decorators/role.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private prisma: PrismaService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()]
		)
		if (!requiredRoles) {
			return true
		}

		const request = context.switchToHttp().getRequest()
		const user = request.user

		const foundUser = await this.prisma.user.findUnique({
			where: { id: user.id }
		})

		if (!foundUser) return false

		return requiredRoles.includes(foundUser.role)
	}
}
