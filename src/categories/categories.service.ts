import {
	BadRequestException,
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
		const category = this.prisma.category.findUnique({ where: { id } })
		if (!category)
			throw new BadRequestException('Category with this id doesn’t exist')

		return category
	}

	async finCategoryByTitleOrFail(title: string) {
		const category = this.prisma.category.findUnique({
			where: { title }
		})

		if (category)
			throw new ConflictException('Category with this title already exist')
	}

	async getAllCategories() {
		return this.prisma.category.findMany()
	}

	async getCategoryById(id: number) {
		return this.findCategoryByIdOrFail(id)
	}

	async getPostsByCategoryId(id: number) {
		const posts = this.prisma.category.findMany({
			where: { id },
			include: {
				postCategory: true
			}
		})

		if (!posts)
			throw new NotFoundException('None post associated with this category')

		return posts
	}

	async createCategory(dto: CreateCategoryDto) {
		await this.finCategoryByTitleOrFail(dto.title)

		return this.prisma.category.create({
			data: {
				...dto
			}
		})
	}

	async updateCategory(dto: UpdateCategoryDto, id: number) {
		await this.findCategoryByIdOrFail(id)
		await this.finCategoryByTitleOrFail(dto.title)

		return this.prisma.category.update({
			where: { id },
			data: {
				...dto
			}
		})
	}

	async deleteCategory(id: number) {
		await this.findCategoryByIdOrFail(id)
		return this.prisma.category.delete({ where: { id } })
	}
}
