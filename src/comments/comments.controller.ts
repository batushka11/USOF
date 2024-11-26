import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { CommentsService } from './comments.service'
import { CreateLikeDto } from './dto/create_like.dto'
import { UpdateCommentDto } from './dto/update_comment.dto'

import { AuthGuard } from '@nestjs/passport'
import {
	ApiCreateLikeByCommentId,
	ApiDeleteCommentById,
	ApiDeleteLikeByCommentId,
	ApiGetCommentById,
	ApiGetLikesByCommentId,
	ApiUpdateCommentById
} from './docs/comments.swagger'

@Auth()
@ApiTags('Comments')
@ApiBearerAuth()
@Controller('comments')
@UseGuards(AuthGuard('jwt'))
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@Auth()
	@ApiGetCommentById()
	@HttpCode(200)
	@Get('/:id')
	getCommentById(@Param('id', ParseIntPipe) id: number) {
		return this.commentsService.getCommentById(id)
	}

	@Auth()
	@ApiGetLikesByCommentId()
	@HttpCode(200)
	@Get('/:id/like')
	getLikesByCommentId(@Param('id', ParseIntPipe) id: number) {
		return this.commentsService.getLikesByCommentId(id)
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@ApiCreateLikeByCommentId()
	@HttpCode(201)
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
	@HttpCode(200)
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
	@HttpCode(204)
	@Delete('/:id')
	deleteCommentById(
		@Param('id', ParseIntPipe) commentId: number,
		@CurrentUser('id') authorId: number
	) {
		return this.commentsService.deleteCommentById(commentId, authorId)
	}

	@Auth()
	@ApiDeleteLikeByCommentId()
	@HttpCode(204)
	@Delete('/:id/like')
	deleteLikeByCommentId(
		@Param('id', ParseIntPipe) commentId: number,
		@CurrentUser('id') authorId: number
	) {
		return this.commentsService.deleteLikeByCommentId(commentId, authorId)
	}
}
