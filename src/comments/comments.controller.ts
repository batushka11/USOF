import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { CommentsService } from './comments.service'
import { CreateLikeDto } from './dto/create_like.dto'
import { UpdateCommentDto } from './dto/update_comment.dto'

@Controller('comments')
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@Auth()
	@Get('/:id')
	async getCommentById(@Param('id', ParseIntPipe) id: number) {
		return this.commentsService.getCommentById(id)
	}

	@Auth()
	@Get('/:id/like')
	async getLikesByCommentId(@Param('id', ParseIntPipe) id: number) {
		return this.commentsService.getLikesByCommentId(id)
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@Post('/:id/like')
	async createLikeByCommentId(
		@Param('id', ParseIntPipe) commentId: number,
		@CurrentUser('id') authorId: number,
		@Body() dto: CreateLikeDto
	) {
		return this.commentsService.createLikesByCommentId(commentId, authorId, dto)
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@Patch('/:id')
	async updateCommentById(
		@Param('id', ParseIntPipe) commentId: number,
		@CurrentUser('id') authorId: number,
		@Body() dto: UpdateCommentDto
	) {
		return this.commentsService.updateCommentById(commentId, authorId, dto)
	}

	@Auth()
	@Delete('/:id')
	async deleteCommentById(
		@Param('id', ParseIntPipe) commentId: number,
		@CurrentUser('id') authorId: number
	) {
		return this.commentsService.deleteCommentById(commentId, authorId)
	}

	@Auth()
	@Post('/:id/like')
	async deleteLikeByCommentId(
		@Param('id', ParseIntPipe) commentId: number,
		@CurrentUser('id') authorId: number
	) {
		return this.commentsService.deleteLikeByCommentId(commentId, authorId)
	}
}
