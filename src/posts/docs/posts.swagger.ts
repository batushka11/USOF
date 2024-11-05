import { applyDecorators } from '@nestjs/common'
import {
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse
} from '@nestjs/swagger'
import { CreatePostDto } from 'src/posts/dto/create_post.dto'
import { UpdatePostDto } from 'src/posts/dto/update_post.dto'

export const ApiGetAllPosts = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Get all posts with pagination, filtering, and sorting'
		}),

		ApiQuery({
			name: 'page',
			type: Number,
			required: false,
			example: 1,
			description: 'Current page number'
		}),
		ApiQuery({
			name: 'limit',
			type: Number,
			required: false,
			example: 10,
			description: 'Number of posts per page'
		}),

		ApiQuery({
			name: 'title',
			type: String,
			required: false,
			example: 'javascript',
			description: 'Filter posts by title containing this string'
		}),
		ApiQuery({
			name: 'status',
			type: String,
			required: false,
			example: 'ACTIVE',
			description: 'Filter posts by status'
		}),
		ApiQuery({
			name: 'date[start]',
			type: String,
			required: false,
			example: '2024-07-01',
			description: 'Filter posts published from this start date (YYYY-MM-DD)'
		}),
		ApiQuery({
			name: 'date[end]',
			type: String,
			required: false,
			example: '2024-08-01',
			description: 'Filter posts published up to this end date (YYYY-MM-DD)'
		}),
		ApiQuery({
			name: 'category',
			type: [String],
			required: false,
			example: ['technology', 'lifestyle'],
			description:
				'Filter posts by categories (comma-separated values accepted)'
		}),

		ApiQuery({
			name: 'sortBy',
			type: String,
			required: false,
			example: 'title',
			description: 'Field to sort by (rating, title, date)'
		}),
		ApiQuery({
			name: 'order',
			type: String,
			enum: ['asc', 'desc'],
			required: false,
			example: 'asc',
			description: 'Order of sorting (asc for ascending, desc for descending)'
		}),

		ApiResponse({
			status: 200,
			description:
				'Returns a list of posts with pagination, filtering, and sorting metadata(default sort by rating in desc order)',
			schema: {
				example: {
					posts: [
						{
							id: 1,
							title: 'First Post',
							content: 'Content here',
							authorId: 1,
							status: 'ACTIVE'
						}
					],
					totalCount: 100,
					page: 1,
					limit: 10,
					totalPages: 10,
					nextPage: 2,
					previousPage: null
				}
			}
		})
	)

export const ApiGetPostById = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get a specific post by ID' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the post'
		}),
		ApiResponse({
			status: 200,
			description: 'Returns the post with the specified ID',
			schema: {
				example: {
					id: 1,
					title: 'First Post',
					content: 'Content here',
					authorId: 1,
					status: 'ACTIVE'
				}
			}
		}),
		ApiResponse({
			status: 404,
			description: 'Post not found',
			schema: {
				example: { message: 'Post with this ID does not exist' }
			}
		}),
		ApiResponse({
			status: 403,
			description: 'User not authorized to view this post',
			schema: {
				example: { message: 'User not authorized to view this post' }
			}
		})
	)

export const ApiGetCommentsByPostId = () =>
	applyDecorators(
		ApiOperation({
			summary:
				'Get comments for a specific post with pagination and sort by rating desc'
		}),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the post'
		}),
		ApiQuery({
			name: 'page',
			type: Number,
			required: false,
			example: 1,
			description: 'Current page number'
		}),
		ApiQuery({
			name: 'limit',
			type: Number,
			required: false,
			example: 10,
			description: 'Number of comments per page'
		}),
		ApiResponse({
			status: 200,
			description: 'Returns comments for the post',
			schema: {
				example: {
					comments: [{ id: 1, content: 'Nice post!', authorId: 2, postId: 1 }],
					totalComments: 20,
					page: 1,
					limit: 10,
					totalPages: 2,
					nextPage: 2,
					previousPage: null,
					hasNextPage: true,
					hasPreviousPage: false
				}
			}
		}),
		ApiResponse({
			status: 404,
			description: 'Post not found',
			schema: {
				example: { message: 'Post with this ID does not exist' }
			}
		})
	)

export const ApiGetLikesByPostId = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get likes for a specific post' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the post'
		}),
		ApiResponse({
			status: 200,
			description: 'Returns likes for the post',
			schema: {
				example: [{ id: 1, postId: 1, authorId: 2, type: 'LIKE' }]
			}
		}),
		ApiResponse({
			status: 404,
			description: 'Post not found',
			schema: {
				example: { message: 'Post with this ID does not exist' }
			}
		})
	)

export const ApiAddCommentByPostId = () =>
	applyDecorators(
		ApiOperation({ summary: 'Add a comment to a specific post' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the post'
		}),
		ApiBody({
			schema: { example: { content: 'This is a comment' } }
		}),
		ApiResponse({
			status: 201,
			description: 'Comment added successfully',
			schema: {
				example: { id: 2, content: 'This is a comment', authorId: 1, postId: 1 }
			}
		}),
		ApiResponse({
			status: 404,
			description: 'Post not found',
			schema: {
				example: { message: 'Post with this ID does not exist' }
			}
		})
	)

export const ApiGetCategoriesByPostId = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get categories for a specific post' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the post'
		}),
		ApiResponse({
			status: 200,
			description: 'Returns categories associated with the post',
			schema: {
				example: [
					{ id: 1, title: 'Technology', description: 'Tech-related posts' }
				]
			}
		}),
		ApiResponse({
			status: 404,
			description: 'Post or categories not found',
			schema: {
				example: { message: 'No categories found for the specified post' }
			}
		})
	)

export const ApiCreatePost = () =>
	applyDecorators(
		ApiOperation({ summary: 'Create a new post' }),
		ApiBody({
			type: CreatePostDto
		}),
		ApiResponse({
			status: 201,
			description: 'Post created successfully',
			schema: {
				example: {
					id: 1,
					title: 'New Post',
					content: 'Content here',
					authorId: 1,
					status: 'ACTIVE'
				}
			}
		}),
		ApiResponse({
			status: 400,
			description: 'Validation error',
			schema: {
				example: { message: 'Title and content fields are required' }
			}
		})
	)

export const ApiCreateLikeByPostId = () =>
	applyDecorators(
		ApiOperation({ summary: 'Like a specific post' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the post'
		}),
		ApiBody({
			schema: { example: { type: 'LIKE' } }
		}),
		ApiResponse({
			status: 201,
			description: 'Like added successfully',
			schema: {
				example: { id: 1, postId: 1, authorId: 2, type: 'LIKE' }
			}
		}),
		ApiResponse({
			status: 409,
			description: 'User has already liked this post',
			schema: {
				example: { message: 'User has already liked this post' }
			}
		})
	)

export const ApiUpdatePostById = () =>
	applyDecorators(
		ApiOperation({ summary: 'Update a specific post' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the post'
		}),
		ApiBody({
			type: UpdatePostDto
		}),
		ApiResponse({
			status: 200,
			description: 'Post updated successfully',
			schema: {
				example: {
					id: 1,
					title: 'Updated Post',
					content: 'Updated content',
					status: 'INACTIVE'
				}
			}
		}),
		ApiResponse({
			status: 403,
			description: 'User not authorized to update this post',
			schema: {
				example: { message: 'User not authorized to update this post' }
			}
		}),
		ApiResponse({
			status: 404,
			description: 'Post not found',
			schema: {
				example: { message: 'Post with this ID does not exist' }
			}
		})
	)

export const ApiDeletePostById = () =>
	applyDecorators(
		ApiOperation({ summary: 'Delete a specific post' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the post'
		}),
		ApiResponse({
			status: 204,
			description: 'Post deleted successfully'
		}),
		ApiResponse({
			status: 403,
			description: 'User not authorized to delete this post',
			schema: {
				example: { message: 'User with this ID cannot delete this post' }
			}
		}),
		ApiResponse({
			status: 404,
			description: 'Post not found',
			schema: {
				example: { message: 'Post with this ID does not exist' }
			}
		})
	)

export const ApiDeleteLikeByPostId = () =>
	applyDecorators(
		ApiOperation({ summary: 'Delete a like from a specific post' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the post'
		}),
		ApiResponse({
			status: 204,
			description: 'Like deleted successfully'
		}),
		ApiResponse({
			status: 404,
			description: 'Like not found for this post',
			schema: {
				example: { message: 'Like with this post ID does not exist' }
			}
		})
	)
export const ApiAddPostToFavorite = () =>
	applyDecorators(
		ApiOperation({ summary: 'Add a post to user’s favorite list' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the post to add to favorites'
		}),
		ApiResponse({
			status: 201,
			description: 'Successfully added post to favorites',
			schema: {
				example: {
					id: 1,
					userId: 1,
					postId: 1,
					post: {
						id: 1,
						title: 'Sample Post',
						content: 'Post content here'
					}
				}
			}
		}),
		ApiResponse({
			status: 400,
			description: 'Cannot add inactive post to favorite',
			schema: {
				example: { message: 'You cannot add inactive post to favorite' }
			}
		}),
		ApiResponse({
			status: 409,
			description: 'Post already in user’s favorite list',
			schema: {
				example: { message: 'User has already added this post to favorite' }
			}
		})
	)

export const ApiDeletePostFromFavorite = () =>
	applyDecorators(
		ApiOperation({ summary: 'Remove a post from user’s favorite list' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the post to remove from favorites'
		}),
		ApiResponse({
			status: 204,
			description: 'Successfully removed post from favorites'
		}),
		ApiResponse({
			status: 404,
			description: 'Post not found in user’s favorite list',
			schema: {
				example: { message: 'User doesn’t have this post in favorite' }
			}
		}),
		ApiResponse({
			status: 403,
			description:
				'User does not have permission to remove this post from favorites',
			schema: {
				example: { message: 'Forbidden' }
			}
		})
	)
export const ApiAddPostToSubscribe = () =>
	applyDecorators(
		ApiOperation({ summary: 'Add a post to user’s subscribe list' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the post to add to subscribe'
		}),
		ApiResponse({
			status: 201,
			description: 'Successfully added post to subscribe',
			schema: {
				example: {
					id: 1,
					userId: 1,
					postId: 1,
					post: {
						id: 1,
						title: 'Sample Post',
						content: 'Post content here'
					}
				}
			}
		}),
		ApiResponse({
			status: 400,
			description: 'Cannot add inactive post to subscribe',
			schema: {
				example: { message: 'You cannot add inactive post to subscribe' }
			}
		}),
		ApiResponse({
			status: 409,
			description: 'Post already in user’s subscribe list',
			schema: {
				example: { message: 'User has already added this post to subscribe' }
			}
		})
	)

export const ApiDeletePostFromSubscribe = () =>
	applyDecorators(
		ApiOperation({ summary: 'Remove a post from user’s subscribe list' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the post to remove from subscribe'
		}),
		ApiResponse({
			status: 204,
			description: 'Successfully removed post from subscribe'
		}),
		ApiResponse({
			status: 404,
			description: 'Post not found in user’s subscribe list',
			schema: {
				example: { message: 'User doesn’t have this post in subscribe' }
			}
		}),
		ApiResponse({
			status: 403,
			description:
				'User does not have permission to remove this post from subscribe',
			schema: {
				example: { message: 'Forbidden' }
			}
		})
	)
