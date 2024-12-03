import {
	BadRequestException,
	ForbiddenException,
	Injectable
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Role, User } from '@prisma/client'
import { hash } from 'argon2'
import { Filtering } from 'src/filtering/filter.interface'
import { Pagination } from 'src/pagination/pagination_params.decorator'
import { PrismaService } from 'src/prisma/prisma.service'
import { Sorting } from 'src/sorting/sort.interface'
import { S3Service } from './aws_service/s3.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		private s3Service: S3Service,
		private readonly configService: ConfigService
	) {}

	async getAllUsers(
		{ page, limit, size, offset }: Pagination,
		{ sortBy, order }: Sorting
	) {
		const [users, totalCount] = await Promise.all([
			this.prisma.user.findMany({
				take: limit,
				skip: offset,
				orderBy: { [sortBy]: order }
			}),
			this.prisma.user.count()
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
				isConfirm: true,
				avatarPath: this.configService.get<string>('AWS_DEFAULT_IMAGE_URL')
			}
		})

		return user
	}

	async updateUserAvatar(id: number, file: Express.Multer.File) {
		const user = await this.prisma.user.findUnique({ where: { id } })

		if (!user) throw new BadRequestException('User with this id doesn`t exist')

		await this.s3Service.deleteFileFromUrl(user.avatarPath)
		const filePath = await this.s3Service.uploadFile(file)

		return this.prisma.user.update({
			where: { id },
			data: { avatarPath: filePath }
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

		await this.prisma.user.delete({
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

	async getFavoritePost(
		userId: number,
		{ page, limit, offset }: Pagination,
		{ sortBy, order }: Sorting,
		{ date, status, title, category }: Filtering
	) {
		const where: any = {}

		if (category && category.length > 0) {
			where.categories = {
				some: {
					category: {
						title: { in: category }
					}
				}
			}
		}

		if (date?.start || date?.end) {
			where.publishAt = {
				...(date.start && { gte: new Date(date.start) }),
				...(date.end && { lte: new Date(date.end) })
			}
		}

		let postIds = []

		if (title) {
			const rawTitleSearchResults = await this.prisma.$queryRaw<
				{ id: number }[]
			>`
            SELECT id FROM Post WHERE LOWER(title) LIKE CONCAT('%', LOWER(${title}), '%')
        `
			postIds = rawTitleSearchResults.map(post => post.id)
			where.id = { in: postIds }
		}
		const [posts, totalCount] = await Promise.all([
			this.prisma.postFavorite.findMany({
				where: { userId, post: where },
				take: limit,
				skip: offset,
				orderBy: {
					post: { [sortBy]: order }
				},
				include: {
					post: {
						include: {
							PostFavorite: {
								where: { userId },
								select: { postId: true }
							},
							PostSubscribe: {
								where: { userId },
								select: { postId: true }
							}
						}
					}
				}
			}),
			this.prisma.postFavorite.count({ where: { userId, post: where } })
		])

		const totalPages = Math.ceil(totalCount / limit)
		const hasNextPage = page < totalPages
		const hasPreviousPage = page > 1
		const nextPage = hasNextPage ? page + 1 : null
		const previousPage = hasPreviousPage ? page - 1 : null

		return {
			posts: posts.map(favorite => ({
				...favorite.post,
				isBookmarked: favorite.post.PostFavorite.length > 0,
				isSubscribed: favorite.post.PostSubscribe.length > 0
			})),
			totalCount,
			page,
			limit,
			totalPages,
			nextPage,
			previousPage
		}
	}

	async getSubscribePost(
		userId: number,
		{ page, limit, offset }: Pagination,
		{ sortBy, order }: Sorting,
		{ date, status, title, category }: Filtering
	) {
		const where: any = {}

		if (category && category.length > 0) {
			where.categories = {
				some: {
					category: {
						title: { in: category }
					}
				}
			}
		}

		if (date?.start || date?.end) {
			where.publishAt = {
				...(date.start && { gte: new Date(date.start) }),
				...(date.end && { lte: new Date(date.end) })
			}
		}

		let postIds = []

		if (title) {
			const rawTitleSearchResults = await this.prisma.$queryRaw<
				{ id: number }[]
			>`
            SELECT id FROM Post WHERE LOWER(title) LIKE CONCAT('%', LOWER(${title}), '%')
        `
			postIds = rawTitleSearchResults.map(post => post.id)
			where.id = { in: postIds }
		}
		const [posts, totalCount] = await Promise.all([
			this.prisma.postSubscribe.findMany({
				where: { userId, post: where },
				take: limit,
				skip: offset,
				orderBy: {
					post: { [sortBy]: order }
				},
				include: {
					post: {
						include: {
							PostFavorite: {
								where: { userId },
								select: { postId: true }
							},
							PostSubscribe: {
								where: { userId },
								select: { postId: true }
							}
						}
					}
				}
			}),
			this.prisma.postSubscribe.count({ where: { userId, post: where } })
		])

		const totalPages = Math.ceil(totalCount / limit)
		const hasNextPage = page < totalPages
		const hasPreviousPage = page > 1
		const nextPage = hasNextPage ? page + 1 : null
		const previousPage = hasPreviousPage ? page - 1 : null

		return {
			posts: posts.map(subscribe => ({
				...subscribe.post,
				isBookmarked: subscribe.post.PostFavorite.length > 0,
				isSubscribed: subscribe.post.PostSubscribe.length > 0
			})),
			totalCount,
			page,
			limit,
			totalPages,
			nextPage,
			previousPage
		}
	}

	async getUserPost(
		userId: number,
		{ page, limit, offset }: Pagination,
		{ sortBy, order }: Sorting,
		{ date, status, title, category }: Filtering,
		user: User
	) {
		const where: any = {}

		where.authorId = userId

		where.status =
			user.role === Role.ADMIN || user.id === userId ? undefined : 'ACTIVE'

		if (category && category.length > 0) {
			where.categories = {
				some: {
					category: {
						title: { in: category }
					}
				}
			}
		}

		if (date?.start || date?.end) {
			where.publishAt = {
				...(date.start && { gte: new Date(date.start) }),
				...(date.end && { lte: new Date(date.end) })
			}
		}

		let postIds = []

		if (title) {
			const rawTitleSearchResults = await this.prisma.$queryRaw<
				{ id: number }[]
			>`
            SELECT id FROM Post WHERE LOWER(title) LIKE CONCAT('%', LOWER(${title}), '%')
        `
			postIds = rawTitleSearchResults.map(post => post.id)
			where.id = { in: postIds }
		}
		const [posts, totalCount] = await Promise.all([
			this.prisma.post.findMany({
				where,
				take: limit,
				skip: offset,
				orderBy: { [sortBy]: order },
				include: {
					PostFavorite: {
						where: { userId },
						select: { postId: true }
					},
					PostSubscribe: {
						where: { userId },
						select: { postId: true }
					}
				}
			}),
			this.prisma.post.count({ where })
		])

		const enrichedPosts = posts.map(
			({ PostFavorite, PostSubscribe, ...post }) => ({
				...post,
				isBookmarked: PostFavorite.length > 0,
				isSubscribed: PostSubscribe.length > 0
			})
		)

		const totalPages = Math.ceil(totalCount / limit)
		const hasNextPage = page < totalPages
		const hasPreviousPage = page > 1
		const nextPage = hasNextPage ? page + 1 : null
		const previousPage = hasPreviousPage ? page - 1 : null

		return {
			posts: enrichedPosts,
			totalCount,
			page,
			limit,
			totalPages,
			nextPage,
			previousPage
		}
	}
}
