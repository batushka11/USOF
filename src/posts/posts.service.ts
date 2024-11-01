import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Role, Status, Type, User } from '@prisma/client'
import { CreateLikeDto } from 'src/comments/dto/create_like.dto'
import { Pagination } from 'src/pagination/pagination_params.decorator'
import { PrismaService } from 'src/prisma/prisma.service'
import { Sorting } from 'src/sorting/sort.interface'
import { CreatePostDto } from './dto/create_post.dto'
import { UpdatePostDto } from './dto/update_post.dto'

@Injectable()
export class PostsService {
	constructor(private prisma: PrismaService) {}

	private async findPostOrFail(postId: number) {
		const post = await this.prisma.post.findUnique({ where: { id: postId } })
		if (!post) {
			throw new NotFoundException('Post with this id doesn’t exist')
		}
		return post
	}

	async getAllPosts(
		{ page, limit, offset }: Pagination,
		{ property, direction }: Sorting,
		user: User
	) {
		const status = user.role === 'USER' ? Status.ACTIVE : undefined

		const orderBy =
			property === 'like'
				? { like: { _count: direction } }
				: { [property]: direction }

		const [posts, totalCount] = await Promise.all([
			this.prisma.post.findMany({
				where: { status },
				take: limit,
				skip: offset,
				orderBy
			}),
			this.prisma.post.count({
				where: { status }
			})
		])

		const totalPages = Math.ceil(totalCount / limit)
		const hasNextPage = page < totalPages
		const hasPreviousPage = page > 1
		const nextPage = hasNextPage ? page + 1 : null
		const previousPage = hasPreviousPage ? page - 1 : null

		return {
			posts,
			totalCount,
			page,
			limit,
			totalPages,
			nextPage,
			previousPage
		}
	}

	async getPostById(id: number, userRole: Role) {
		const post = await this.findPostOrFail(id)
		if (post.status === 'INACTIVE' && userRole !== 'ADMIN')
			throw new ForbiddenException('User not authorized to see this post')

		return post
	}

	async getCommentsByPostId(id: number, { page, limit, offset }: Pagination) {
		const post = await this.prisma.post.findUnique({ where: { id } })

		if (!post) {
			throw new NotFoundException('Post with this id doesn’t exist')
		}

		const [comments, totalComments] = await Promise.all([
			this.prisma.comment.findMany({
				where: { postId: id },
				take: limit,
				skip: offset
			}),
			this.prisma.comment.count({ where: { postId: id } })
		])

		const totalPages = Math.ceil(totalComments / limit)
		const hasNextPage = page < totalPages
		const hasPreviousPage = page > 1
		const nextPage = hasNextPage ? page + 1 : null
		const previousPage = hasPreviousPage ? page - 1 : null

		return {
			comments,
			totalComments,
			page,
			limit,
			totalPages,
			nextPage,
			previousPage
		}
	}

	async addCommentByPostId(postId: number, content: string, authorId: number) {
		await this.findPostOrFail(postId)
		return this.prisma.comment.create({
			data: { content, postId, authorId }
		})
	}

	async getCategoriesByPostId(id: number) {
		const postWithCategories = await this.prisma.post.findUnique({
			where: { id },
			include: {
				categories: { select: { category: true } }
			}
		})

		if (!postWithCategories)
			throw new NotFoundException('Post with this id doesn’t exist')

		if (!postWithCategories.categories)
			throw new NotFoundException('Post with this id doesn’t exist categories')

		return postWithCategories.categories
	}

	async getLikesByPostId(id: number) {
		const postWithLikes = await this.prisma.post.findUnique({
			where: { id },
			include: { like: true }
		})

		if (!postWithLikes) {
			throw new NotFoundException('Post with this id doesn’t exist')
		}

		return postWithLikes.like
	}

	private async handleCategories(categoryTitles: string[]) {
		return Promise.all(
			categoryTitles.map(async title => {
				let category = await this.prisma.category.findUnique({
					where: { title }
				})

				if (!category)
					throw new NotFoundException('This category doesn’t exist')

				return { id: category.id }
			})
		)
	}

	async createPost(dto: CreatePostDto, authorId: number) {
		const categoryIds = await this.handleCategories(dto.categories)

		return this.prisma.post.create({
			data: {
				title: dto.title,
				content: dto.content,
				status: dto.status ?? 'ACTIVE',
				authorId: authorId,
				categories: {
					create: categoryIds.map(category => ({
						category: { connect: { id: category.id } }
					}))
				}
			},
			include: {
				categories: { select: { category: true } }
			}
		})
	}

	async interactWithPost(
		postId: number,
		authorId: number,
		interactionType: Type
	) {
		await this.findPostOrFail(postId)

		const existingInteraction = await this.prisma.like.findFirst({
			where: { postId, authorId }
		})

		if (existingInteraction) {
			throw new ConflictException(
				`User has already ${interactionType.toLowerCase()}d this post`
			)
		}

		return this.prisma.like.create({
			data: { postId, authorId, type: interactionType }
		})
	}

	async createLikeByPostId(
		postId: number,
		authorId: number,
		dto: CreateLikeDto
	) {
		return this.interactWithPost(postId, authorId, dto.type)
	}

	async deleteLikeByPostId(postId: number, authorId: number) {
		await this.findPostOrFail(postId)

		const like = await this.prisma.like.findFirst({
			where: {
				authorId,
				postId
			}
		})

		if (!like)
			throw new NotFoundException('Like with this post id doesn’t exist')

		if (like.authorId !== authorId) throw new ForbiddenException()

		await this.prisma.like.delete({ where: { id: like.id } })
	}

	async updatePostById(postId: number, dto: UpdatePostDto, author: User) {
		const post = await this.findPostOrFail(postId)

		if (post.authorId !== author.id && author.role !== Role.ADMIN) {
			throw new ForbiddenException('User with this id cannot update this post')
		}

		const categoryIds = await this.handleCategories(dto.categories)

		return this.prisma.post.update({
			where: { id: postId },
			data: {
				title: dto.title,
				content: dto.content,
				status: dto.status ?? post.status,
				categories: {
					deleteMany: {},
					create: categoryIds.map(category => ({
						category: { connect: { id: category.id } }
					}))
				}
			},
			include: {
				categories: { select: { category: true } }
			}
		})
	}

	async deletePostById(postId: number, user: User) {
		const post = await this.findPostOrFail(postId)

		if (post.authorId !== user.id && user.role !== Role.ADMIN) {
			throw new ForbiddenException('User with this id cannot delete this post')
		}

		await this.prisma.post.delete({ where: { id: postId } })
	}
}
