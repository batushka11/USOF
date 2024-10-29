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

	private async getCommentOrFail(id: number) {
		const comment = await this.prisma.comment.findUnique({ where: { id } })
		if (!comment)
			throw new NotFoundException('Comment with this id doesn’t exist')
		return comment
	}

	private ensureCommentAuthor(comment, authorId: number) {
		if (comment.authorId !== authorId) {
			throw new ForbiddenException()
		}
	}

	async getCommentById(id: number) {
		return this.getCommentOrFail(id)
	}

	async getLikesByCommentId(id: number) {
		await this.getCommentOrFail(id)
		return this.prisma.like.findMany({ where: { commentId: id } })
	}

	async interactWithComment(
		commentId: number,
		authorId: number,
		interactionType: Type
	) {
		const comment = await this.getCommentOrFail(commentId)
		this.ensureCommentAuthor(comment, authorId)

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
		const comment = await this.getCommentOrFail(commentId)
		this.ensureCommentAuthor(comment, authorId)

		const like = await this.prisma.like.findFirst({
			where: { authorId, commentId }
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
		const comment = await this.getCommentOrFail(commentId)
		this.ensureCommentAuthor(comment, authorId)

		return this.prisma.comment.update({
			where: { id: commentId, authorId },
			data: dto
		})
	}

	async deleteCommentById(commentId: number, authorId: number) {
		const comment = await this.getCommentOrFail(commentId)
		this.ensureCommentAuthor(comment, authorId)

		return this.prisma.comment.delete({
			where: { id: commentId, authorId }
		})
	}
}
