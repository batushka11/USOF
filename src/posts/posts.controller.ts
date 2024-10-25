import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards
} from '@nestjs/common'
import { User } from '@prisma/client'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { RolesGuard } from 'src/user/guards/role.guard'
import { createPost } from './dto/create_post.dto'
import { updatePostDto } from './dto/update_post.dto'
import { PostsService } from './posts.service'

@Auth()
@Controller('posts')
@UseGuards(RolesGuard)
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Get()
	async getAllPosts() {
		return this.postsService.getAllPosts()
	}

	@Get('/:id')
	async getPostById(@Param('id', ParseIntPipe) id: number) {
		return this.postsService.getPostById(id)
	}

	@Get('/:id/comments')
	async getCommentsByPostId(@Param('id', ParseIntPipe) id: number) {
		return this.postsService.getCommentsByPostId(id)
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

	@Post('/')
	async createPost(@Body() dto: createPost) {
		return this.postsService.createPost(dto)
	}

	@Post('/:id/like')
	async likePost(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser('id') userId: number
	) {
		return this.postsService.likePost(postId, userId)
	}

	@Patch('/:id')
	async updatePostById(
		@Param('id', ParseIntPipe) postId: number,
		@Body() dto: updatePostDto,
		@CurrentUser('id') userId: number
	) {
		return this.postsService.updatePostById(postId, dto, userId)
	}

	@Delete('/:id')
	async deletePostById(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser() user: User
	) {
		return this.postsService.deletePostById(postId, user)
	}

	@Delete('/:id/like')
	async dislikePost(
		@Param('id', ParseIntPipe) postId: number,
		@CurrentUser('id') userId: number
	) {
		return this.postsService.dislikePost(postId, userId)
	}
}
