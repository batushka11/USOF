import { applyDecorators } from '@nestjs/common'
import {
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse
} from '@nestjs/swagger'

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
					id: 1,
					title: 'Technology',
					description: 'All about tech and gadgets'
				}
			}
		}),
		ApiResponse({ status: 404, description: 'Category not found' })
	)

export const ApiGetPostsByCategoryId = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get posts by category ID' }),
		ApiResponse({
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
		}),
		ApiResponse({
			status: 404,
			description: 'No posts associated with this category.'
		})
	)

export const ApiCreateCategory = () =>
	applyDecorators(
		ApiOperation({ summary: 'Create a new category' }),
		ApiBody({
			description: 'Data for the new category',
			schema: {
				example: {
					title: 'Science',
					description: 'Latest discoveries and updates in science'
				}
			}
		}),
		ApiResponse({
			status: 201,
			description: 'Category created successfully',
			schema: {
				example: {
					id: 2,
					title: 'Science',
					description: 'Latest discoveries and updates in science'
				}
			}
		}),
		ApiResponse({
			status: 409,
			description: 'Category with this title already exists'
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
			schema: {
				example: {
					title: 'Updated Science',
					description: 'New description for science category'
				}
			}
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
		ApiResponse({ status: 404, description: 'Category not found' }),
		ApiResponse({
			status: 409,
			description: 'Category with this title already exists'
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
		ApiResponse({ status: 204, description: 'Category deleted successfully' }),
		ApiResponse({ status: 404, description: 'Category not found' })
	)
