import {
	BadRequestException,
	createParamDecorator,
	ExecutionContext
} from '@nestjs/common'
import { Filtering } from './filter.interface'

export const FilteringParams = createParamDecorator(
	(data, ctx: ExecutionContext): Filtering | null => {
		const req = ctx.switchToHttp().getRequest()
		const { date, category, status, title } = req.query

		const start = date?.start
		const end = date?.end

		const isValidDate = (dateStr: string) => !isNaN(Date.parse(dateStr))

		if (start && !isValidDate(start)) {
			throw new BadRequestException(`Invalid start date: ${start}`)
		}
		if (end && !isValidDate(end)) {
			throw new BadRequestException(`Invalid end date: ${end}`)
		}

		let parsedCategory: string[] | undefined
		if (category) {
			parsedCategory = Array.isArray(category)
				? category
				: category.split(',').map((c: string) => c.trim())
		}

		return {
			title: title ? (title as string) : undefined,
			status: status ? (status.toUpperCase() as string) : undefined,
			date: start || end ? { start, end } : undefined,
			category: parsedCategory
		}
	}
)
