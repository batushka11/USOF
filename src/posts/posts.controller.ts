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

import { Filtering } from 'src/filtering/filter.interface'
import { FilteringParams } from 'src/filtering/filter_params.decorator'
import { Sorting } from 'src/sorting/sort.interface'
import { SortingParams } from 'src/sorting/sort_params.decorator'
import {
	ApiAddCommentByPostId,
	ApiAddPostToFavorite,
	ApiAddPostToSubscribe,
	ApiCreateLikeByPostId,
	ApiCreatePost,
	ApiDeleteLikeByPostId,
	ApiDeletePostById,
	ApiDeletePostFromFavorite,
	ApiDeletePostFromSubscribe,
	ApiGetAllPosts,
	ApiGetCategoriesByPostId,
	ApiGetCommentsByPostId,
	ApiGetLikesByPostId,
	ApiGetPostById,
	ApiUpdatePostById
} from './docs/posts.swagger'

@ApiTags('Posts')
@ApiBearerAuth()
@Auth()
@Controller('posts')
@UseGuards(RolesGuard)
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@ApiGetAllPosts()
	@HttpCode(200)
	@Get()
	async getAllPosts(
		@PaginationParams() paginationParams: Pagination,
		@SortingParams() sortingParams: Sorting,
		@FilteringParams() filteringParams: Filtering,
		@CurrentUser() user: User
	) {
		return this.postsService.getAllPosts(
			paginationParams,
			sortingParams,
			filteringParams,
			user
		)
	}

	@ApiGetPostById()
	@HttpCode(200)
	@Get('/:id')
	async getPostById(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser('role') userRole: Role
	) {
		return this.postsService.getPostById(id, userRole)
	}

	@ApiGetCommentsByPostId()
	@HttpCode(200)
	@Get('/:id/comments')
	async getCommentsByPostId(
		@Param('id', ParseIntPipe) id: number,
		@PaginationParams() paginationParams: Pagination
	) {
		return this.postsService.getCommentsByPostId(id, paginationParams)
	}

	@ApiAddCommentByPostId()
	@HttpCode(201)
	@Post('/:id/comments')
	async addCommentByPostId(
		@Param('id', ParseIntPipe) idPost: number,
		@Body() body: { content: string },
		@CurrentUser('id') idAuthor: number
	) {
		return this.postsService.addCommentByPostId(idPost, body, idAuthor)
	}

	@ApiGetCategoriesByPostId()
	@HttpCode(200)
	@Get('/:id/categories')
	async getCategoriesByPostId(@Param('id', ParseIntPipe) id: number) {
		return this.postsService.getCategoriesByPostId(id)
	}

	@ApiGetLikesByPostId()
	@HttpCode(200)
	@Get('/:id/like')
	async getLikesByPostId(@Param('id', ParseIntPipe) id: number) {
		return this.postsService.getLikesByPostId(id)
	}

	@ApiCreatePost()
	@HttpCode(201)
	@UsePipes(new ValidationPipe())
	@Post('/')
	async createPost(@Body() dto: CreatePostDto, @CurrentUser('id') id: number) {
		return this.postsService.createPost(dto, id)
	}

	@ApiCreateLikeByPostId()
	@HttpCode(201)
	@UsePipes(new ValidationPipe())
	@Post('/:id/like')
	async createLikeByPostId(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser('id') userId: number,
		@Body() dto: CreateLikeDto
	) {
		return this.postsService.createLikeByPostId(postId, userId, dto)
	}

	@ApiUpdatePostById()
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	@Patch('/:id')
	async updatePostById(
		@Param('id', ParseIntPipe) postId: number,
		@Body() dto: UpdatePostDto,
		@CurrentUser() user: User
	) {
		return this.postsService.updatePostById(postId, dto, user)
	}

	@ApiDeletePostById()
	@HttpCode(204)
	@Delete('/:id')
	async deletePostById(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser() user: User
	) {
		return this.postsService.deletePostById(postId, user)
	}

	@ApiDeleteLikeByPostId()
	@HttpCode(204)
	@Delete('/:id/like')
	async deleteLikeByPostId(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser('id') userId: number
	) {
		return this.postsService.deleteLikeByPostId(postId, userId)
	}

	@ApiAddPostToFavorite()
	@HttpCode(201)
	@Post('/:id/favorite')
	async addPostToFavorite(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser('id') userId: number
	) {
		return this.postsService.addPostToFavorite(postId, userId)
	}

	@ApiDeletePostFromFavorite()
	@HttpCode(204)
	@Delete('/:id/favorite')
	async deletePostFromFavorite(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser('id') userId: number
	) {
		return this.postsService.deletePostFromFavorite(postId, userId)
	}

	@ApiAddPostToSubscribe()
	@HttpCode(201)
	@Post('/:id/subscribe')
	async addPostToSubscribe(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser('id') userId: number
	) {
		return this.postsService.addPostToSubscribe(postId, userId)
	}

	@ApiDeletePostFromSubscribe()
	@HttpCode(204)
	@Delete('/:id/subscribe')
	async deletePostFromSubscribe(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser('id') userId: number
	) {
		return this.postsService.deletePostFromSubscribe(postId, userId)
	}
}
