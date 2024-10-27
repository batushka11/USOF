import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Role, User } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
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

	async getAllPosts() {
		return this.prisma.post.findMany()
	}

	async getPostById(id: number) {
		return this.findPostOrFail(id)
	}

	async getCommentsByPostId(id: number) {
		const postWithComments = await this.prisma.post.findUnique({
			where: { id },
			include: { comments: true }
		})

		if (!postWithComments) {
			throw new NotFoundException('Post with this id doesn’t exist')
		}

		return postWithComments
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

		if (!postWithCategories) {
			throw new NotFoundException('Post with this id doesn’t exist')
		}

		return postWithCategories
	}

	async getLikesByPostId(id: number) {
		const postWithLikes = await this.prisma.post.findUnique({
			where: { id },
			include: { like: true }
		})

		if (!postWithLikes) {
			throw new NotFoundException('Post with this id doesn’t exist')
		}

		return postWithLikes
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
		interactionType: 'LIKE' | 'DISLIKE'
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

	async likePost(postId: number, authorId: number) {
		return this.interactWithPost(postId, authorId, 'LIKE')
	}

	async dislikePost(postId: number, authorId: number) {
		return this.interactWithPost(postId, authorId, 'DISLIKE')
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

		return this.prisma.post.delete({ where: { id: postId } })
	}
}
