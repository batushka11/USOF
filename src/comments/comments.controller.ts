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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { CommentsService } from './comments.service'
import { CreateLikeDto } from './dto/create_like.dto'
import { UpdateCommentDto } from './dto/update_comment.dto'

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@Auth()
	@Get('/:id')
	@ApiParam({
		name: 'id',
		type: Number,
		description: 'The ID of the comment to retrieve.'
	})
	@ApiOperation({
		summary: 'Get a comment by ID',
		description: 'Retrieve a comment based on its unique identifier.'
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved comment.'
	})
	@ApiResponse({ status: 404, description: 'Comment not found.' })
	getCommentById(@Param('id', ParseIntPipe) id: number) {
		return this.commentsService.getCommentById(id)
	}

	@Auth()
	@Get('/:id/like')
	@ApiParam({
		name: 'id',
		type: Number,
		description: 'The ID of the comment to retrieve likes for.'
	})
	@ApiOperation({
		summary: 'Get likes for a comment',
		description: 'Retrieve all likes associated with a specific comment.'
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved likes for the comment.'
	})
	@ApiResponse({ status: 404, description: 'Comment not found.' })
	getLikesByCommentId(@Param('id', ParseIntPipe) id: number) {
		return this.commentsService.getLikesByCommentId(id)
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@Post('/:id/like')
	@ApiParam({
		name: 'id',
		type: Number,
		description: 'The ID of the comment to like.'
	})
	@ApiOperation({
		summary: 'Like a comment',
		description:
			'Create a like for a specific comment. A user can only like a comment once.'
	})
	@ApiResponse({ status: 201, description: 'Successfully liked the comment.' })
	@ApiResponse({ status: 404, description: 'Comment not found.' })
	@ApiResponse({
		status: 409,
		description: 'User has already liked this comment.'
	})
	createLikeByCommentId(
		@Param('id', ParseIntPipe) commentId: number,
		@CurrentUser('id') authorId: number,
		@Body() dto: CreateLikeDto
	) {
		return this.commentsService.createLikesByCommentId(commentId, authorId, dto)
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@Patch('/:id')
	@ApiParam({
		name: 'id',
		type: Number,
		description: 'The ID of the comment to update.'
	})
	@ApiOperation({
		summary: 'Update a comment',
		description:
			'Update the content of a comment by its ID. Only the author can update the comment.'
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully updated the comment.'
	})
	@ApiResponse({ status: 404, description: 'Comment not found.' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden: You do not have permission to update this comment.'
	})
	updateCommentById(
		@Param('id', ParseIntPipe) commentId: number,
		@CurrentUser('id') authorId: number,
		@Body() dto: UpdateCommentDto
	) {
		return this.commentsService.updateCommentById(commentId, authorId, dto)
	}

	@Auth()
	@Delete('/:id')
	@ApiParam({
		name: 'id',
		type: Number,
		description: 'The ID of the comment to delete.'
	})
	@ApiOperation({
		summary: 'Delete a comment',
		description:
			'Remove a comment by its ID. Only the author can delete the comment.'
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully deleted the comment.'
	})
	@ApiResponse({ status: 404, description: 'Comment not found.' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden: You do not have permission to delete this comment.'
	})
	deleteCommentById(
		@Param('id', ParseIntPipe) commentId: number,
		@CurrentUser('id') authorId: number
	) {
		return this.commentsService.deleteCommentById(commentId, authorId)
	}

	@Auth()
	@Delete('/:id/like')
	@ApiParam({
		name: 'id',
		type: Number,
		description: 'The ID of the comment to remove like.'
	})
	@ApiOperation({
		summary: 'Remove like from a comment',
		description:
			'Delete a like from a comment by its ID. Only the user who liked the comment can remove their like.'
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully removed like from the comment.'
	})
	@ApiResponse({ status: 404, description: 'Comment not found.' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden: You do not have permission to remove this like.'
	})
	deleteLikeByCommentId(
		@Param('id', ParseIntPipe) commentId: number,
		@CurrentUser('id') authorId: number
	) {
		return this.commentsService.deleteLikeByCommentId(commentId, authorId)
	}
}
