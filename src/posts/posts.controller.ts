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
import { User } from '@prisma/client'
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

@Auth()
@Controller('posts')
@UseGuards(RolesGuard)
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Get()
	async getAllPosts(
		@PaginationParams() paginationParams: Pagination,
		@CurrentUser() user: User
	) {
		return this.postsService.getAllPosts(paginationParams, user)
	}

	@Get('/:id')
	async getPostById(@Param('id', ParseIntPipe) id: number) {
		return this.postsService.getPostById(id)
	}

	@Get('/:id/comments')
	async getCommentsByPostId(
		@Param('id', ParseIntPipe) id: number,
		@PaginationParams() paginationParams: Pagination
	) {
		return this.postsService.getCommentsByPostId(id, paginationParams)
	}

	@Post('/:id/comments')
	async addCommentByPostId(
		@Param('id', ParseIntPipe) idPost: number,
		content: string,
		@CurrentUser('id') idAuthor: number
	) {
		return this.postsService.addCommentByPostId(idPost, content, idAuthor)
	}

	@Get('/:id/categories')
	async getCategoriesByPostId(@Param('id', ParseIntPipe) id: number) {
		return this.postsService.getCategoriesByPostId(id)
	}

	@Get('/:id/like')
	async getLikesByPostId(@Param('id', ParseIntPipe) id: number) {
		return this.postsService.getLikesByPostId(id)
	}

	@UsePipes(new ValidationPipe())
	@Post('/')
	async createPost(@Body() dto: CreatePostDto, @CurrentUser('id') id: number) {
		return this.postsService.createPost(dto, id)
	}

	@UsePipes(new ValidationPipe())
	@Post('/:id/like')
	async createLikeByPostId(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser('id') userId: number,
		@Body() dto: CreateLikeDto
	) {
		return this.postsService.createLikeByPostId(postId, userId, dto)
	}

	@UsePipes(new ValidationPipe())
	@Patch('/:id')
	async updatePostById(
		@Param('id', ParseIntPipe) postId: number,
		@Body() dto: UpdatePostDto,
		@CurrentUser() user: User
	) {
		return this.postsService.updatePostById(postId, dto, user)
	}

	@Delete('/:id')
	async deletePostById(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser() user: User
	) {
		return this.postsService.deletePostById(postId, user)
	}

	@Delete('/:id/like')
	async deleteLikeByPostId(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser('id') userId: number
	) {
		return this.postsService.deleteLikeByPostId(postId, userId)
	}
}
