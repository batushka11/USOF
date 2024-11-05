import { applyDecorators } from '@nestjs/common'
import {
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse
} from '@nestjs/swagger'
import { CreateCategoryDto } from 'src/categories/dto/create_category.dto'
import { UpdateCategoryDto } from 'src/categories/dto/update_category.dto'

export const ApiGetAllCategories = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get all categories with pagination' }),
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
			description: 'Number of categories per page'
		}),
		ApiResponse({
			status: 200,
			description: 'Returns a list of categories with pagination metadata',
			schema: {
				example: {
					categories: [
						{
							id: 1,
							title: 'peony',
							description: 'natus repellendus acervus',
							createdAt: '2024-11-04T13:43:44.985Z'
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

export const ApiGetCategoryById = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get a category by ID' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the category'
		}),
		ApiResponse({
			status: 200,
			description: 'Returns details of the specified category',
			schema: {
				example: {
					id: 9,
					title: 'veto',
					description: 'acies at demoror',
					createdAt: '2024-11-04T13:43:44.985Z'
				}
			}
		}),
		ApiResponse({
			status: 404,
			description: 'Category not found',
			schema: {
				example: { message: 'Category with this id doesn’t exist' }
			}
		})
	)

export const ApiGetPostsByCategoryId = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get posts by category ID' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the category'
		}),
		ApiResponse({
			status: 200,
			description:
				'List of posts associated with the category with pagination.',
			schema: {
				example: {
					posts: [
						{
							id: 10,
							publishAt: '2023-11-12T19:33:54.913Z',
							status: 'ACTIVE',
							content:
								'Vero soleo videlicet occaecati cursim aspernatur. Urbs tam abstergo defero accedo tertius asper. Vociferor cedo tutamen doloribus uberrime vix basium suscipio.',
							title: 'cado turpis',
							authorId: 13,
							rating: 4
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
		}),
		ApiResponse({
			status: 404,
			description: 'No posts associated with this category.',
			schema: {
				example: { message: 'No posts associated with this category' }
			}
		})
	)

export const ApiCreateCategory = () =>
	applyDecorators(
		ApiOperation({ summary: 'Create a new category' }),
		ApiBody({
			description: 'Data for the new category',
			type: CreateCategoryDto
		}),
		ApiResponse({
			status: 201,
			description: 'Category created successfully',
			schema: {
				example: {
					id: 11,
					title: 'Football',
					description: 'All about football',
					createdAt: '2024-11-05T15:53:02.131Z'
				}
			}
		}),
		ApiResponse({
			status: 409,
			description: 'Category with this title already exists',
			schema: {
				example: { message: 'Category with this title already exists' }
			}
		})
	)

export const ApiUpdateCategoryById = () =>
	applyDecorators(
		ApiOperation({ summary: 'Update an existing category by ID' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the category'
		}),
		ApiBody({
			description: 'Updated data for the category',
			type: UpdateCategoryDto
		}),
		ApiResponse({
			status: 200,
			description: 'Category updated successfully',
			schema: {
				example: {
					id: 1,
					title: 'Updated Science',
					description: 'New description for science category'
				}
			}
		}),
		ApiResponse({
			status: 404,
			description: 'Category not found',
			schema: {
				example: { message: 'Category with this id doesn’t exist' }
			}
		}),
		ApiResponse({
			status: 409,
			description: 'Category with this title already exists',
			schema: {
				example: { message: 'Category with this title already exists' }
			}
		})
	)

export const ApiDeleteCategoryById = () =>
	applyDecorators(
		ApiOperation({ summary: 'Delete a category by ID' }),
		ApiParam({
			name: 'id',
			type: Number,
			example: 1,
			description: 'ID of the category'
		}),
		ApiResponse({
			status: 204,
			description: 'Category deleted successfully'
		}),
		ApiResponse({
			status: 404,
			description: 'Category not found',
			schema: {
				example: { message: 'Category with this id doesn’t exist' }
			}
		})
	)
