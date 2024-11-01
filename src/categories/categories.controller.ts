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
} from '../docs/categories/categories.swagger'

@ApiTags('Categories')
@ApiBearerAuth()
@Auth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@ApiGetAllCategories()
	@Get()
	async getAllCategories(@PaginationParams() paginationParams: Pagination) {
		return this.categoriesService.getAllCategories(paginationParams)
	}

	@ApiGetCategoryById()
	@Get('/:id')
	async getCategoryById(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.getCategoryById(id)
	}

	@ApiGetPostsByCategoryId()
	@Get('/:id/posts')
	async getPostsByCategoryId(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: User
	) {
		return this.categoriesService.getPostsByCategoryId(id, user)
	}

	@ApiCreateCategory()
	@Roles(Role.ADMIN)
	@UsePipes(new ValidationPipe())
	@Post()
	async createCategory(@Body() dto: CreateCategoryDto) {
		return this.categoriesService.createCategory(dto)
	}

	@ApiUpdateCategoryById()
	@Roles(Role.ADMIN)
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
	@Delete('/:id')
	async deleteCategory(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.deleteCategory(id)
	}
}
