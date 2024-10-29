import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Type } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateLikeDto } from './dto/create_like.dto'
import { UpdateCommentDto } from './dto/update_comment.dto'

@Injectable()
export class CommentsService {
	constructor(private prisma: PrismaService) {}

	async findCommentOrFail(id: number) {
		const comment = await this.prisma.comment.findUnique({ where: { id } })

		if (!comment)
			throw new NotFoundException('Comment with this id doesn’t exist')

		return comment
	}

	async getCommentById(id: number) {
		return await this.findCommentOrFail(id)
	}

	async getLikesByCommentId(id: number) {
		await this.findCommentOrFail(id)

		const likes = await this.prisma.like.findMany({ where: { commentId: id } })

		return likes
	}

	async interactWithComment(
		commentId: number,
		authorId: number,
		interactionType: Type
	) {
		await this.findCommentOrFail(commentId)

		const existingInteraction = await this.prisma.like.findFirst({
			where: { commentId, authorId }
		})

		if (existingInteraction) {
			throw new ConflictException(
				`User has already ${interactionType.toLowerCase()}d this comment`
			)
		}

		return this.prisma.like.create({
			data: { commentId, authorId, type: interactionType }
		})
	}

	async createLikesByCommentId(
		commentId: number,
		authorId: number,
		dto: CreateLikeDto
	) {
		return this.interactWithComment(commentId, authorId, dto.type)
	}

	async deleteLikeByCommentId(commentId: number, authorId: number) {
		await this.findCommentOrFail(commentId)
		const like = await this.prisma.like.findFirst({
			where: {
				authorId,
				commentId
			}
		})

		if (!like)
			throw new NotFoundException('Like with this comment id doesn’t exist')

		return this.prisma.like.delete({ where: { id: like.id } })
	}

	async updateCommentById(
		commentId: number,
		authorId: number,
		dto: UpdateCommentDto
	) {
		const comment = await this.findCommentOrFail(commentId)
		if (comment.authorId !== authorId)
			throw new ForbiddenException('User with this id can not update comment')

		return this.prisma.comment.update({
			where: { id: commentId, authorId },
			data: dto
		})
	}

	async deleteCommentById(commentId: number, authorId: number) {
		const comment = await this.findCommentOrFail(commentId)
		if (comment.authorId !== authorId)
			throw new ForbiddenException('User with this id can not delete comment')

		return this.prisma.comment.delete({
			where: { id: commentId, authorId }
		})
	}
}
