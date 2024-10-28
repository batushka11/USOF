import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateCategoryDto } from './dto/create_category.dto'
import { UpdateCategoryDto } from './dto/update_category.dto'

@Injectable()
export class CategoriesService {
	constructor(private prisma: PrismaService) {}

	async findCategoryByIdOrFail(id: number) {
		const category = await this.prisma.category.findUnique({ where: { id } })
		if (!category)
			throw new NotFoundException('Category with this id doesn’t exist')
		return category
	}

	async findCategoryByTitleOrFail(title: string) {
		const category = await this.prisma.category.findUnique({ where: { title } })
		if (category)
			throw new ConflictException('Category with this title already exists')
	}

	async getAllCategories() {
		return this.prisma.category.findMany()
	}

	async getCategoryById(id: number) {
		return this.findCategoryByIdOrFail(id)
	}

	async getPostsByCategoryId(id: number) {
		const posts = await this.prisma.category.findMany({
			where: { id },
			include: { postCategory: true }
		})

		if (posts.length === 0)
			throw new NotFoundException('No posts associated with this category')
		return posts
	}

	async createCategory(dto: CreateCategoryDto) {
		await this.findCategoryByTitleOrFail(dto.title)
		return this.prisma.category.create({ data: { ...dto } })
	}

	async updateCategory(dto: UpdateCategoryDto, id: number) {
		const category = await this.findCategoryByIdOrFail(id)
		if (dto.title && dto.title !== category.title) {
			await this.findCategoryByTitleOrFail(dto.title)
		}

		return this.prisma.category.update({
			where: { id },
			data: { ...dto }
		})
	}

	async deleteCategory(id: number) {
		await this.findCategoryByIdOrFail(id)
		return this.prisma.category.delete({ where: { id } })
	}
}
