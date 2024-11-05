import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

export const ApiGetCommentById = () =>
	applyDecorators(
		ApiParam({
			name: 'id',
			type: Number,
			description: 'The ID of the comment to retrieve.'
		}),
		ApiOperation({
			summary: 'Get a comment by ID',
			description: 'Retrieve a comment based on its unique identifier.'
		}),
		ApiResponse({
			status: 200,
			description: 'Successfully retrieved comment.',
			schema: {
				example: {
					id: 3,
					authorId: 13,
					publishAt: '2024-11-04T01:57:02.570Z',
					content: 'Arcus venustas animus velum carbo subvenio.',
					postId: 12,
					rating: 1
				}
			}
		}),
		ApiResponse({
			status: 404,
			description: 'Comment not found.',
			schema: {
				example: { message: 'Comment with this id doesn’t exist' }
			}
		})
	)

export const ApiGetLikesByCommentId = () =>
	applyDecorators(
		ApiParam({
			name: 'id',
			type: Number,
			description: 'The ID of the comment to retrieve likes for.'
		}),
		ApiOperation({
			summary: 'Get likes for a comment',
			description: 'Retrieve all likes associated with a specific comment.'
		}),
		ApiResponse({
			status: 200,
			description: 'Successfully retrieved likes for the comment.',
			schema: {
				example: [
					{
						id: 261,
						authorId: 1,
						publishAt: '2024-11-05T16:04:14.716Z',
						postId: null,
						commentId: 1,
						type: 'LIKE'
					},
					{
						id: 106,
						authorId: 5,
						publishAt: '2024-11-04T12:35:46.885Z',
						postId: null,
						commentId: 1,
						type: 'DISLIKE'
					}
				]
			}
		}),
		ApiResponse({
			status: 404,
			description: 'Comment not found.',
			schema: {
				example: { message: 'Comment with this id doesn’t exist' }
			}
		})
	)

export const ApiCreateLikeByCommentId = () =>
	applyDecorators(
		ApiParam({
			name: 'id',
			type: Number,
			description: 'The ID of the comment to like.'
		}),
		ApiOperation({
			summary: 'Like a comment',
			description:
				'Create a like for a specific comment. A user can only like a comment once.'
		}),
		ApiResponse({
			status: 200,
			description: 'Successfully liked the comment.',
			schema: {
				example: {
					id: 261,
					authorId: 1,
					publishAt: '2024-11-05T16:04:14.716Z',
					postId: null,
					commentId: 1,
					type: 'LIKE'
				}
			}
		}),
		ApiResponse({
			status: 404,
			description: 'Comment not found.',
			schema: {
				example: { message: 'Comment with this id doesn’t exist' }
			}
		}),
		ApiResponse({
			status: 409,
			description: 'User has already liked this comment.',
			schema: {
				example: {
					message: 'User has already liked this comment'
				}
			}
		})
	)

export const ApiUpdateCommentById = () =>
	applyDecorators(
		ApiParam({
			name: 'id',
			type: Number,
			description: 'The ID of the comment to update.'
		}),
		ApiOperation({
			summary: 'Update a comment',
			description:
				'Update the content of a comment by its ID. Only the author can update the comment.'
		}),
		ApiResponse({
			status: 200,
			description: 'Successfully updated the comment.',
			schema: {
				example: {
					id: 3,
					authorId: 13,
					publishAt: '2024-11-04T01:57:02.570Z',
					content:
						'Update content: Arcus venustas animus velum carbo subvenio.',
					postId: 12,
					rating: 1
				}
			}
		}),
		ApiResponse({
			status: 404,
			description: 'Comment not found.',
			schema: {
				example: { message: 'Comment with this id doesn’t exist' }
			}
		}),
		ApiResponse({
			status: 403,
			description:
				'Forbidden: You do not have permission to update this comment.',
			schema: {
				example: {
					message: 'You do not have permission to update this comment'
				}
			}
		})
	)

export const ApiDeleteCommentById = () =>
	applyDecorators(
		ApiParam({
			name: 'id',
			type: Number,
			description: 'The ID of the comment to delete.'
		}),
		ApiOperation({
			summary: 'Delete a comment',
			description:
				'Remove a comment by its ID. Only the author can delete the comment.'
		}),
		ApiResponse({
			status: 204,
			description: 'Successfully deleted the comment.'
		}),
		ApiResponse({
			status: 404,
			description: 'Comment not found.',
			schema: {
				example: { message: 'Comment with this id doesn’t exist' }
			}
		}),
		ApiResponse({
			status: 403,
			description:
				'Forbidden: You do not have permission to delete this comment.',
			schema: {
				example: {
					message: 'You do not have permission to delete this comment'
				}
			}
		})
	)

export const ApiDeleteLikeByCommentId = () =>
	applyDecorators(
		ApiParam({
			name: 'id',
			type: Number,
			description: 'The ID of the comment to remove like.'
		}),
		ApiOperation({
			summary: 'Remove like from a comment',
			description:
				'Delete a like from a comment by its ID. Only the user who liked the comment can remove their like.'
		}),
		ApiResponse({
			status: 204,
			description: 'Successfully removed like from the comment.'
		}),
		ApiResponse({
			status: 404,
			description: 'Like not found for this comment.',
			schema: {
				example: { message: 'Like with this comment id doesn’t exist' }
			}
		}),
		ApiResponse({
			status: 403,
			description: 'Forbidden: You do not have permission to remove this like.',
			schema: {
				example: { message: 'You do not have permission to remove this like' }
			}
		})
	)
