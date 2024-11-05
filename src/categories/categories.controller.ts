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
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Role, User } from '@prisma/client'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import {
	Pagination,
	PaginationParams
} from 'src/pagination/pagination_params.decorator'
import { Roles } from 'src/user/decorators/role.decorator'
import { RolesGuard } from 'src/user/guards/role.guard'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create_category.dto'
import { UpdateCategoryDto } from './dto/update_category.dto'

import {
	ApiCreateCategory,
	ApiDeleteCategoryById,
	ApiGetAllCategories,
	ApiGetCategoryById,
	ApiGetPostsByCategoryId,
	ApiUpdateCategoryById
} from './docs/categories.swagger'

@ApiTags('Categories')
@ApiBearerAuth()
@Auth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@ApiGetAllCategories()
	@HttpCode(200)
	@Get()
	async getAllCategories(@PaginationParams() paginationParams: Pagination) {
		return this.categoriesService.getAllCategories(paginationParams)
	}

	@ApiGetCategoryById()
	@HttpCode(200)
	@Get('/:id')
	async getCategoryById(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.getCategoryById(id)
	}

	@ApiGetPostsByCategoryId()
	@HttpCode(200)
	@Get('/:id/posts')
	async getPostsByCategoryId(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: User,
		@PaginationParams() paginationParams: Pagination
	) {
		return this.categoriesService.getPostsByCategoryId(
			id,
			user,
			paginationParams
		)
	}

	@ApiCreateCategory()
	@Roles(Role.ADMIN)
	@HttpCode(201)
	@UsePipes(new ValidationPipe())
	@Post()
	async createCategory(@Body() dto: CreateCategoryDto) {
		return this.categoriesService.createCategory(dto)
	}

	@ApiUpdateCategoryById()
	@Roles(Role.ADMIN)
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	@Patch('/:id')
	async updateCategory(
		@Body() dto: UpdateCategoryDto,
		@Param('id', ParseIntPipe) id: number
	) {
		return this.categoriesService.updateCategory(dto, id)
	}

	@ApiDeleteCategoryById()
	@Roles(Role.ADMIN)
	@HttpCode(204)
	@Delete('/:id')
	async deleteCategory(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.deleteCategory(id)
	}
}
