import { MailerService } from '@nestjs-modules/mailer'
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Role, Status, Type, User } from '@prisma/client'
import { CreateLikeDto } from 'src/comments/dto/create_like.dto'
import { Filtering } from 'src/filtering/filter.interface'
import { Pagination } from 'src/pagination/pagination_params.decorator'
import { PrismaService } from 'src/prisma/prisma.service'
import { Sorting } from 'src/sorting/sort.interface'
import { CreatePostDto } from './dto/create_post.dto'
import { UpdatePostDto } from './dto/update_post.dto'

@Injectable()
export class PostsService {
	constructor(
		private prisma: PrismaService,
		private mailerService: MailerService
	) {}

	private async findPostOrFail(postId: number) {
		const post = await this.prisma.post.findUnique({ where: { id: postId } })
		if (!post) {
			throw new NotFoundException('Post with this id doesn’t exist')
		}
		return post
	}

	async getAllPosts(
		{ page, limit, offset }: Pagination,
		{ sortBy, order }: Sorting,
		{ date, status, title, category }: Filtering,
		user: User
	) {
		const where: any = {}

		where.status = user.role === Role.ADMIN ? status : 'ACTIVE'

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
						where: {
							userId: user.id
						},
						select: {
							postId: true
						}
					},
					PostSubscribe: {
						where: {
							userId: user.id
						},
						select: {
							postId: true
						}
					}
				}
			}),
			this.prisma.post.count({ where })
		])

		const totalPages = Math.ceil(totalCount / limit)
		const hasNextPage = page < totalPages
		const hasPreviousPage = page > 1
		const nextPage = hasNextPage ? page + 1 : null
		const previousPage = hasPreviousPage ? page - 1 : null

		const enrichedPosts = posts.map(
			({ PostFavorite, PostSubscribe, ...post }) => ({
				...post,
				isBookmarked: PostFavorite.length > 0,
				isSubscribed: PostSubscribe.length > 0
			})
		)

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
				orderBy: { rating: 'desc' },
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

	async addCommentByPostId(
		postId: number,
		commentData: { content: string },
		authorId: number
	) {
		const post = await this.findPostOrFail(postId)

		const newComment = await this.prisma.comment.create({
			data: { content: commentData.content, postId, authorId }
		})

		const subscribers = await this.prisma.postSubscribe.findMany({
			where: { postId },
			include: { user: true }
		})

		await this.prisma.user.update({
			where: { id: authorId },
			data: {
				commentsCount: {
					increment: 1
				}
			}
		})

		for (const subscriber of subscribers) {
			await this.mailerService.sendMail({
				to: subscriber.user.email,
				subject: `New Comment on Post: "${post.title}"`,
				template: 'comment_notification.hbs',
				context: {
					login: subscriber.user.login,
					title: post.title,
					commentContent: commentData.content,
					url: `http://localhost:4200/api/posts/${postId}`
				}
			})
		}

		return newComment
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

		await this.prisma.user.update({
			where: { id: authorId },
			data: {
				postsCount: {
					increment: 1
				}
			}
		})

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
			throw new ConflictException(`User has already interact with this post`)
		}

		await this.prisma.post.update({
			where: { id: postId },
			data: {
				rating: {
					increment: interactionType === Type.LIKE ? 1 : -1
				}
			}
		})

		const user = await this.prisma.post.findUnique({
			where: { id: postId },
			include: {
				user: true
			}
		})

		await this.prisma.user.update({
			where: { id: user.authorId },
			data: {
				rating: {
					increment: interactionType === Type.LIKE ? 1 : -1
				},
				reactionsCount: {
					increment: 1
				}
			}
		})

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

		await this.prisma.post.update({
			where: { id: postId },
			data: {
				rating: {
					increment: like.type === Type.LIKE ? -1 : 1
				}
			}
		})

		const user = await this.prisma.post.findUnique({
			where: { id: postId },
			include: {
				user: true
			}
		})

		await this.prisma.user.update({
			where: { id: user.authorId },
			data: {
				rating: {
					increment: like.type === Type.LIKE ? -1 : 1
				}
			}
		})
	}

	async updatePostById(postId: number, dto: UpdatePostDto, author: User) {
		const post = await this.findPostOrFail(postId)

		if (post.authorId !== author.id && author.role !== Role.ADMIN) {
			throw new ForbiddenException('User with this id cannot update this post')
		}

		let categoryUpdate = {}
		if (dto.categories) {
			const categoryIds = await this.handleCategories(dto.categories)
			categoryUpdate = {
				deleteMany: {},
				create: categoryIds.map(category => ({
					category: { connect: { id: category.id } }
				}))
			}
		}

		const updatedPost = await this.prisma.post.update({
			where: { id: postId },
			data: {
				title: dto.title,
				content: dto.content,
				status: dto.status ?? post.status,
				...(dto.categories && { categories: categoryUpdate })
			},
			include: {
				categories: { select: { category: true } }
			}
		})

		const subscribers = await this.prisma.postSubscribe.findMany({
			where: { postId },
			include: { user: true }
		})

		for (const subscriber of subscribers) {
			await this.mailerService.sendMail({
				to: subscriber.user.email,
				subject: `Post Updated: ${updatedPost.title}`,
				template: 'post_update.hbs',
				context: {
					name: subscriber.user.login,
					title: updatedPost.title,
					url: `http://localhost:4200/api/posts/${postId}`
				}
			})
		}

		return updatedPost
	}

	async deletePostById(postId: number, user: User) {
		const post = await this.findPostOrFail(postId)

		if (post.authorId !== user.id && user.role !== Role.ADMIN) {
			throw new ForbiddenException('User with this id cannot delete this post')
		}

		await this.prisma.post.delete({ where: { id: postId } })
	}

	async addPostToFavorite(postId: number, userId: number) {
		const post = await this.findPostOrFail(postId)

		if (post.status === Status.INACTIVE)
			throw new BadRequestException('You cannot add inactive post to bookmarks')

		const favorite = await this.prisma.postFavorite.findFirst({
			where: { userId, postId }
		})

		if (favorite) {
			throw new ConflictException('You have already add this post to bookmarks')
		}

		await this.prisma.postFavorite.create({
			data: { postId, userId }
		})

		return this.prisma.postFavorite.findFirst({
			where: {
				userId,
				postId
			},
			include: {
				post: true
			}
		})
	}

	async deletePostFromFavorite(postId: number, userId: number) {
		await this.findPostOrFail(postId)

		const favorite = await this.prisma.postFavorite.findFirst({
			where: {
				userId,
				postId
			}
		})

		if (!favorite)
			throw new NotFoundException('You don’t have this post in favorite')

		if (favorite.userId !== userId) throw new ForbiddenException()

		await this.prisma.postFavorite.delete({
			where: {
				postId_userId: { postId, userId }
			}
		})
	}

	async addPostToSubscribe(postId: number, userId: number) {
		const post = await this.findPostOrFail(postId)

		if (post.status === Status.INACTIVE)
			throw new BadRequestException('You cannot add inactive post to subscribe')

		const subscribe = await this.prisma.postSubscribe.findFirst({
			where: { userId, postId }
		})

		if (subscribe) {
			throw new ConflictException('You have already add this post to subscribe')
		}

		await this.prisma.postSubscribe.create({
			data: { postId, userId }
		})

		return this.prisma.postSubscribe.findFirst({
			where: {
				userId,
				postId
			},
			include: {
				post: true
			}
		})
	}

	async deletePostFromSubscribe(postId: number, userId: number) {
		await this.findPostOrFail(postId)

		const subscribe = await this.prisma.postSubscribe.findFirst({
			where: {
				userId,
				postId
			}
		})

		if (!subscribe)
			throw new NotFoundException('You don’t have this post in subscribe')

		if (subscribe.userId !== userId) throw new ForbiddenException()

		await this.prisma.postSubscribe.delete({
			where: {
				postId_userId: { postId, userId }
			}
		})
	}
}
