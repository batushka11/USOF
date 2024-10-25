import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Role, User } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class PostsService {
	constructor(private prisma: PrismaService) {}

	private async validatePostExists(postId: number) {
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
		return this.validatePostExists(id)
	}

	async getCommentsByPostId(id: number) {
		const postWithComments = await this.prisma.post.findUnique({
			where: { id },
			include: {
				comments: true
			}
		})

		if (!postWithComments) {
			throw new NotFoundException('Post with this id doesn’t exist')
		}

		return postWithComments
	}

	async addCommentByPostId(idPost: number, content: string, authorId: number) {
		await this.validatePostExists(idPost)
		return this.prisma.comment.create({
			data: {
				content,
				postId: idPost,
				authorId
			}
		})
	}

	async getCategoriesByPostId(id: number) {
		const postWithCategories = await this.prisma.post.findUnique({
			where: { id },
			include: {
				categories: true
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
			include: {
				like: true
			}
		})

		if (!postWithLikes) {
			throw new NotFoundException('Post with this id doesn’t exist')
		}

		return postWithLikes
	}

	async createPost(dto: any) {
		return this.prisma.post.create({
			data: dto
		})
	}

	async interactWithPost(
		postId: number,
		authorId: number,
		interactionType: 'LIKE' | 'DISLIKE'
	) {
		await this.validatePostExists(postId)

		const existingInteraction = await this.prisma.like.findFirst({
			where: {
				postId,
				authorId
			}
		})

		if (existingInteraction) {
			throw new BadRequestException(
				`User has already ${interactionType.toLowerCase()}d this post`
			)
		}

		return this.prisma.like.create({
			data: {
				postId,
				authorId,
				type: interactionType
			}
		})
	}

	async likePost(postId: number, authorId: number) {
		return this.interactWithPost(postId, authorId, 'LIKE')
	}

	async dislikePost(postId: number, authorId: number) {
		return this.interactWithPost(postId, authorId, 'DISLIKE')
	}

	async updatePostById(postId: number, dto: any, authorId: number) {
		const post = await this.validatePostExists(postId)

		if (post.authorId !== authorId) {
			throw new BadRequestException('User with this id cannot update this post')
		}

		return this.prisma.post.update({
			where: { id: postId },
			data: dto
		})
	}

	async deletePostById(postId: number, user: User) {
		const post = await this.validatePostExists(postId)

		if (post.authorId !== user.id && user.role !== Role.ADMIN) {
			throw new BadRequestException('User with this id cannot delete this post')
		}

		return this.prisma.post.delete({
			where: { id: postId }
		})
	}
}
