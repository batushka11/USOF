import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Status, User } from '@prisma/client'
import { Pagination } from 'src/pagination/pagination.interface'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateCategoryDto } from './dto/create_category.dto'
import { UpdateCategoryDto } from './dto/update_category.dto'

@Injectable()
export class CategoriesService {
	constructor(private prisma: PrismaService) {}

	async ensureCategoryByIdExists(id: number) {
		const category = await this.prisma.category.findUnique({ where: { id } })
		if (!category)
			throw new NotFoundException('Category with this id doesn’t exist')
		return category
	}

	async ensureCategoryTitleUnique(title: string) {
		const category = await this.prisma.category.findUnique({ where: { title } })
		if (category)
			throw new ConflictException('Category with this title already exists')
	}

	async getAllCategories() {
		const categories = await this.prisma.category.findMany()
		if (!categories) throw new NotFoundException('No one categories exists')
		return categories
	}

	async getCategoryById(id: number) {
		return this.ensureCategoryByIdExists(id)
	}

	async getPostsByCategoryId(
		id: number,
		user: User,
		{ page, limit, offset }: Pagination
	) {
		const status = user.role === 'USER' ? Status.ACTIVE : undefined
		await this.ensureCategoryByIdExists(id)

		const [posts, totalCount] = await Promise.all([
			this.prisma.post.findMany({
				where: {
					status,
					categories: {
						some: {
							categoryId: id
						}
					}
				},
				take: limit,
				skip: offset
			}),
			this.prisma.post.count({
				where: {
					status,
					categories: {
						some: {
							categoryId: id
						}
					}
				}
			})
		])

		const totalPages = Math.ceil(totalCount / limit)
		const hasNextPage = page < totalPages
		const hasPreviousPage = page > 1
		const nextPage = hasNextPage ? page + 1 : null
		const previousPage = hasPreviousPage ? page - 1 : null

		return {
			posts,
			totalCount,
			page,
			limit,
			totalPages,
			nextPage,
			previousPage
		}
	}

	async createCategory(dto: CreateCategoryDto) {
		await this.ensureCategoryTitleUnique(dto.title)
		return this.prisma.category.create({ data: { ...dto } })
	}

	async updateCategory(dto: UpdateCategoryDto, id: number) {
		const category = await this.ensureCategoryByIdExists(id)

		if (dto.title && dto.title !== category.title) {
			await this.ensureCategoryTitleUnique(dto.title)
		}

		return this.prisma.category.update({
			where: { id },
			data: { ...dto }
		})
	}

	async deleteCategory(id: number) {
		await this.ensureCategoryByIdExists(id)
		await this.prisma.category.delete({ where: { id } })
	}
}
