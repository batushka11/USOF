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
import { AuthGuard } from '@nestjs/passport'
import { Role } from '@prisma/client'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { Roles } from 'src/user/decorators/role.decorator'
import { RolesGuard } from 'src/user/guards/role.guard'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create_category.dto'
import { UpdateCategoryDto } from './dto/update_category.dto'

@Auth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Get()
	async getAllCategories() {
		return this.categoriesService.getAllCategories()
	}

	@Get('/:id')
	async getCategoryById(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.getCategoryById(id)
	}

	@Get('/:id/posts')
	async getPostsByCategoryId(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.getPostsByCategoryId(id)
	}

	@Roles(Role.ADMIN)
	@Post()
	async createCategory(@Body() dto: CreateCategoryDto) {
		return this.categoriesService.createCategory(dto)
	}

	@Roles(Role.ADMIN)
	@Patch('/:id')
	async updateCategory(
		@Body() dto: UpdateCategoryDto,
		@Param('id', ParseIntPipe) id: number
	) {
		return this.categoriesService.updateCategory(dto, id)
	}

	@Roles(Role.ADMIN)
	@Delete('/:id')
	async deleteCategory(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.deleteCategory(id)
	}
}
