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
import {
	Pagination,
	PaginationParams
} from 'src/pagination/pagination_params.decorator'
import { Roles } from 'src/user/decorators/role.decorator'
import { RolesGuard } from 'src/user/guards/role.guard'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create_category.dto'
import { UpdateCategoryDto } from './dto/update_category.dto'

@ApiTags('Categories')
@ApiBearerAuth()
@Auth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@ApiOperation({ summary: 'Get all categories with pagination' })
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
		description: 'Number of categories per page'
	})
	@ApiResponse({
		status: 200,
		description: 'Returns a list of categories with pagination metadata',
		schema: {
			example: {
				categories: [
					{
						id: 1,
						title: 'Technology',
						description: 'All about tech and gadgets'
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
	async getAllCategories(@PaginationParams() paginationParams: Pagination) {
		return this.categoriesService.getAllCategories(paginationParams)
	}

	@ApiOperation({ summary: 'Get a category by ID' })
	@ApiParam({
		name: 'id',
		type: Number,
		example: 1,
		description: 'ID of the category'
	})
	@ApiResponse({
		status: 200,
		description: 'Returns details of the specified category',
		schema: {
			example: {
				id: 1,
				title: 'Technology',
				description: 'All about tech and gadgets'
			}
		}
	})
	@ApiResponse({ status: 404, description: 'Category not found' })
	@Get('/:id')
	async getCategoryById(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.getCategoryById(id)
	}

	@Get('/:id/posts')
	@ApiOperation({ summary: 'Get posts by category ID' })
	@ApiResponse({
		status: 200,
		description: 'List of posts associated with the category.',
		schema: {
			example: [
				{
					id: 41,
					publishAt: '2023-05-01T10:15:30.000Z',
					status: 'ACTIVE',
					content: 'Example content for post 41...',
					title: 'Sample Post 41',
					authorId: 5
				},
				{
					id: 44,
					publishAt: '2023-05-02T10:15:30.000Z',
					status: 'ACTIVE',
					content: 'Example content for post 44...',
					title: 'Sample Post 44',
					authorId: 8
				}
			]
		}
	})
	@ApiResponse({
		status: 404,
		description: 'No posts associated with this category.'
	})
	async getPostsByCategoryId(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: User
	) {
		return this.categoriesService.getPostsByCategoryId(id, user)
	}

	@ApiOperation({ summary: 'Create a new category' })
	@ApiBody({
		description: 'Data for the new category',
		schema: {
			example: {
				title: 'Science',
				description: 'Latest discoveries and updates in science'
			}
		}
	})
	@ApiResponse({
		status: 201,
		description: 'Category created successfully',
		schema: {
			example: {
				id: 2,
				title: 'Science',
				description: 'Latest discoveries and updates in science'
			}
		}
	})
	@ApiResponse({
		status: 409,
		description: 'Category with this title already exists'
	})
	@Roles(Role.ADMIN)
	@UsePipes(new ValidationPipe())
	@Post()
	async createCategory(@Body() dto: CreateCategoryDto) {
		return this.categoriesService.createCategory(dto)
	}

	@ApiOperation({ summary: 'Update an existing category by ID' })
	@ApiParam({
		name: 'id',
		type: Number,
		example: 1,
		description: 'ID of the category'
	})
	@ApiBody({
		description: 'Updated data for the category',
		schema: {
			example: {
				title: 'Updated Science',
				description: 'New description for science category'
			}
		}
	})
	@ApiResponse({
		status: 200,
		description: 'Category updated successfully',
		schema: {
			example: {
				id: 1,
				title: 'Updated Science',
				description: 'New description for science category'
			}
		}
	})
	@ApiResponse({ status: 404, description: 'Category not found' })
	@ApiResponse({
		status: 409,
		description: 'Category with this title already exists'
	})
	@Roles(Role.ADMIN)
	@UsePipes(new ValidationPipe())
	@Patch('/:id')
	async updateCategory(
		@Body() dto: UpdateCategoryDto,
		@Param('id', ParseIntPipe) id: number
	) {
		return this.categoriesService.updateCategory(dto, id)
	}

	@ApiOperation({ summary: 'Delete a category by ID' })
	@ApiParam({
		name: 'id',
		type: Number,
		example: 1,
		description: 'ID of the category'
	})
	@ApiResponse({ status: 204, description: 'Category deleted successfully' })
	@ApiResponse({ status: 404, description: 'Category not found' })
	@Roles(Role.ADMIN)
	@Delete('/:id')
	async deleteCategory(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.deleteCategory(id)
	}
}
