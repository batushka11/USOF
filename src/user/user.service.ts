import {
	BadRequestException,
	ForbiddenException,
	Injectable
} from '@nestjs/common'
import { Role, User } from '@prisma/client'
import { hash } from 'argon2'
import { Pagination } from 'src/pagination/pagination_params.decorator'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getAllUsers({ page, limit, size, offset }: Pagination) {
		const [users, totalCount] = await Promise.all([
			this.prisma.post.findMany({
				take: limit,
				skip: offset
			}),
			this.prisma.post.count()
		])

		const totalPages = Math.ceil(totalCount / limit)
		const hasNextPage = page < totalPages
		const hasPreviousPage = page > 1
		const nextPage = hasNextPage ? page + 1 : null
		const previousPage = hasPreviousPage ? page - 1 : null

		return {
			users,
			totalCount,
			page,
			limit,
			totalPages,
			nextPage,
			previousPage
		}
	}

	async getUserById(id: number) {
		const user = await this.prisma.user.findUnique({ where: { id } })

		if (!user) throw new BadRequestException('User with this id doesn`t exist')

		return user
	}

	async createUser(dto: CreateUserDto) {
		await this.checkUserExists(dto.email, dto.login)

		if (dto.password !== dto.password_confirm)
			throw new BadRequestException('Password must be the same')

		const user = await this.prisma.user.create({
			data: {
				login: dto.login,
				fullname: dto.fullname,
				email: dto.email,
				password: await hash(dto.password),
				role: dto.role,
				isConfirm: true
			}
		})

		return user
	}

	async updateUserAvatar(id: number, path: string) {
		return this.prisma.user.update({
			where: { id },
			data: { avatarPath: path }
		})
	}

	async updateUser(id: number, dto: UpdateUserDto, currentUser: User) {
		const user = await this.prisma.user.findUnique({ where: { id } })

		if (!user) throw new BadRequestException('User with this id doesn`t exist')

		if (id !== currentUser.id && currentUser.role !== Role.ADMIN)
			throw new ForbiddenException(
				'You don`t have access to update another user'
			)

		if (dto.email || dto.login) {
			await this.checkUserExists(dto.email, dto.login)
		}

		return this.prisma.user.update({
			where: { id },
			data: dto
		})
	}

	async removeById(id: number, currentUser: User) {
		const user = await this.prisma.user.findUnique({ where: { id } })

		if (!user) throw new BadRequestException('User with this id doesn`t exist')

		if (id !== currentUser.id && currentUser.role !== Role.ADMIN)
			throw new ForbiddenException(
				'You don`t have access to remove another user'
			)

		return this.prisma.user.delete({
			where: { id }
		})
	}

	private async checkUserExists(email: string, login: string) {
		if (email) {
			const userByEmail = await this.prisma.user.findUnique({
				where: { email }
			})
			if (userByEmail)
				throw new BadRequestException('User with this email already exists')
		}
		if (login) {
			const userByLogin = await this.prisma.user.findUnique({
				where: { login }
			})

			if (userByLogin)
				throw new BadRequestException('User with this login already exists')
		}
	}
}
