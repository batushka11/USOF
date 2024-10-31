import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { Role, User } from '@prisma/client'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { CreateLikeDto } from 'src/comments/dto/create_like.dto'
import {
	Pagination,
	PaginationParams
} from 'src/pagination/pagination_params.decorator'
import { RolesGuard } from 'src/user/guards/role.guard'
import { CreatePostDto } from './dto/create_post.dto'
import { UpdatePostDto } from './dto/update_post.dto'
import { PostsService } from './posts.service'

@ApiTags('Posts')
@ApiBearerAuth()
@Auth()
@Controller('posts')
@UseGuards(RolesGuard)
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@ApiOperation({ summary: 'Get all posts with pagination' })
	@ApiQuery({
		name: 'page',
		type: Number,
		required: false,
		example: 1,
		description: 'Current page number'
	})
	@ApiQuery({
		name: 'limit',
		type: Number,
		required: false,
		example: 10,
		description: 'Number of posts per page'
	})
	@ApiResponse({
		status: 200,
		description: 'Returns a list of posts with pagination metadata',
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
	@Get()
	async getAllPosts(
		@PaginationParams() paginationParams: Pagination,
		@CurrentUser() user: User
	) {
		return this.postsService.getAllPosts(paginationParams, user)
	}

	@ApiOperation({ summary: 'Get a specific post by ID' })
	@ApiParam({
		name: 'id',
		type: Number,
		example: 1,
		description: 'ID of the post'
	})
	@ApiResponse({
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
	})
	@ApiResponse({ status: 404, description: 'Post not found' })
	@ApiResponse({
		status: 403,
		description: 'User not authorized to update this post'
	})
	@Get('/:id')
	async getPostById(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser('role') userRole: Role
	) {
		return this.postsService.getPostById(id, userRole)
	}

	@ApiOperation({ summary: 'Get comments for a specific post with pagination' })
	@ApiParam({
		name: 'id',
		type: Number,
		example: 1,
		description: 'ID of the post'
	})
	@ApiQuery({
		name: 'page',
		type: Number,
		required: false,
		example: 1,
		description: 'Current page number'
	})
	@ApiQuery({
		name: 'limit',
		type: Number,
		required: false,
		example: 10,
		description: 'Number of comments per page'
	})
	@ApiResponse({
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
	})
	@ApiResponse({ status: 404, description: 'Post not found' })
	@Get('/:id/comments')
	async getCommentsByPostId(
		@Param('id', ParseIntPipe) id: number,
		@PaginationParams() paginationParams: Pagination
	) {
		return this.postsService.getCommentsByPostId(id, paginationParams)
	}

	@ApiOperation({ summary: 'Add a comment to a specific post' })
	@ApiParam({
		name: 'id',
		type: Number,
		example: 1,
		description: 'ID of the post'
	})
	@ApiBody({ schema: { example: { content: 'This is a comment' } } })
	@ApiResponse({
		status: 201,
		description: 'Comment added successfully',
		schema: {
			example: { id: 2, content: 'This is a comment', authorId: 1, postId: 1 }
		}
	})
	@ApiResponse({ status: 404, description: 'Post not found' })
	@Post('/:id/comments')
	async addCommentByPostId(
		@Param('id', ParseIntPipe) idPost: number,
		@Body() content: string,
		@CurrentUser('id') idAuthor: number
	) {
		return this.postsService.addCommentByPostId(idPost, content, idAuthor)
	}

	@ApiOperation({ summary: 'Get categories for a specific post' })
	@ApiParam({
		name: 'id',
		type: Number,
		example: 1,
		description: 'ID of the post'
	})
	@ApiResponse({
		status: 200,
		description: 'Returns categories associated with the post',
		schema: {
			example: [
				{ id: 1, title: 'Technology', description: 'Tech-related posts' }
			]
		}
	})
	@ApiResponse({ status: 404, description: 'Post or categories not found' })
	@Get('/:id/categories')
	async getCategoriesByPostId(@Param('id', ParseIntPipe) id: number) {
		return this.postsService.getCategoriesByPostId(id)
	}

	@ApiOperation({ summary: 'Get likes for a specific post' })
	@ApiParam({
		name: 'id',
		type: Number,
		example: 1,
		description: 'ID of the post'
	})
	@ApiResponse({
		status: 200,
		description: 'Returns likes for the post',
		schema: {
			example: [{ id: 1, postId: 1, authorId: 2, type: 'LIKE' }]
		}
	})
	@ApiResponse({ status: 404, description: 'Post not found' })
	@Get('/:id/like')
	async getLikesByPostId(@Param('id', ParseIntPipe) id: number) {
		return this.postsService.getLikesByPostId(id)
	}

	@ApiOperation({ summary: 'Create a new post' })
	@ApiBody({
		schema: {
			example: {
				title: 'New Post',
				content: 'Content here',
				status: 'ACTIVE',
				categories: ['Tech', 'Science']
			}
		}
	})
	@ApiResponse({
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
	})
	@UsePipes(new ValidationPipe())
	@Post('/')
	async createPost(@Body() dto: CreatePostDto, @CurrentUser('id') id: number) {
		return this.postsService.createPost(dto, id)
	}

	@ApiOperation({ summary: 'Like a specific post' })
	@ApiParam({
		name: 'id',
		type: Number,
		example: 1,
		description: 'ID of the post'
	})
	@ApiBody({ schema: { example: { type: 'LIKE' } } })
	@ApiResponse({
		status: 201,
		description: 'Like added successfully',
		schema: {
			example: { id: 1, postId: 1, authorId: 2, type: 'LIKE' }
		}
	})
	@ApiResponse({ status: 409, description: 'User has already liked this post' })
	@UsePipes(new ValidationPipe())
	@Post('/:id/like')
	async createLikeByPostId(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser('id') userId: number,
		@Body() dto: CreateLikeDto
	) {
		return this.postsService.createLikeByPostId(postId, userId, dto)
	}

	@ApiOperation({ summary: 'Update a specific post' })
	@ApiParam({
		name: 'id',
		type: Number,
		example: 1,
		description: 'ID of the post'
	})
	@ApiBody({
		schema: {
			example: {
				title: 'Updated Post',
				content: 'Updated content',
				status: 'INACTIVE',
				categories: ['Tech']
			}
		}
	})
	@ApiResponse({
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
	})
	@ApiResponse({
		status: 403,
		description: 'User not authorized to update this post'
	})
	@ApiResponse({ status: 404, description: 'Post not found' })
	@UsePipes(new ValidationPipe())
	@Patch('/:id')
	async updatePostById(
		@Param('id', ParseIntPipe) postId: number,
		@Body() dto: UpdatePostDto,
		@CurrentUser() user: User
	) {
		return this.postsService.updatePostById(postId, dto, user)
	}

	@ApiOperation({ summary: 'Delete a specific post' })
	@ApiParam({
		name: 'id',
		type: Number,
		example: 1,
		description: 'ID of the post'
	})
	@ApiResponse({ status: 200, description: 'Post deleted successfully' })
	@ApiResponse({
		status: 403,
		description: 'User not authorized to delete this post'
	})
	@ApiResponse({ status: 404, description: 'Post not found' })
	@Delete('/:id')
	async deletePostById(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser() user: User
	) {
		return this.postsService.deletePostById(postId, user)
	}

	@ApiOperation({ summary: 'Delete a like from a specific post' })
	@ApiParam({
		name: 'id',
		type: Number,
		example: 1,
		description: 'ID of the post'
	})
	@ApiResponse({ status: 200, description: 'Like deleted successfully' })
	@ApiResponse({ status: 404, description: 'Like not found for this post' })
	@Delete('/:id/like')
	async deleteLikeByPostId(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser('id') userId: number
	) {
		return this.postsService.deleteLikeByPostId(postId, userId)
	}
}
