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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { CommentsService } from './comments.service'
import { CreateLikeDto } from './dto/create_like.dto'
import { UpdateCommentDto } from './dto/update_comment.dto'

import {
	ApiCreateLikeByCommentId,
	ApiDeleteCommentById,
	ApiDeleteLikeByCommentId,
	ApiGetCommentById,
	ApiGetLikesByCommentId,
	ApiUpdateCommentById
} from '../docs/comments/comments.swagger'

@Auth()
@ApiTags('Comments')
@ApiBearerAuth()
@Controller('comments')
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@Auth()
	@ApiGetCommentById()
	@Get('/:id')
	getCommentById(@Param('id', ParseIntPipe) id: number) {
		return this.commentsService.getCommentById(id)
	}

	@Auth()
	@ApiGetLikesByCommentId()
	@Get('/:id/like')
	getLikesByCommentId(@Param('id', ParseIntPipe) id: number) {
		return this.commentsService.getLikesByCommentId(id)
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@ApiCreateLikeByCommentId()
	@Post('/:id/like')
	createLikeByCommentId(
		@Param('id', ParseIntPipe) commentId: number,
		@CurrentUser('id') authorId: number,
		@Body() dto: CreateLikeDto
	) {
		return this.commentsService.createLikesByCommentId(commentId, authorId, dto)
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@ApiUpdateCommentById()
	@Patch('/:id')
	updateCommentById(
		@Param('id', ParseIntPipe) commentId: number,
		@CurrentUser('id') authorId: number,
		@Body() dto: UpdateCommentDto
	) {
		return this.commentsService.updateCommentById(commentId, authorId, dto)
	}

	@Auth()
	@ApiDeleteCommentById()
	@Delete('/:id')
	deleteCommentById(
		@Param('id', ParseIntPipe) commentId: number,
		@CurrentUser('id') authorId: number
	) {
		return this.commentsService.deleteCommentById(commentId, authorId)
	}

	@Auth()
	@ApiDeleteLikeByCommentId()
	@Delete('/:id/like')
	deleteLikeByCommentId(
		@Param('id', ParseIntPipe) commentId: number,
		@CurrentUser('id') authorId: number
	) {
		return this.commentsService.deleteLikeByCommentId(commentId, authorId)
	}
}
