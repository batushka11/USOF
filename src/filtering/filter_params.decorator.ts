import {
	BadRequestException,
	createParamDecorator,
	ExecutionContext
} from '@nestjs/common'
import { Filtering } from './filter.interface'

export const FilteringParams = createParamDecorator(
	(data, ctx: ExecutionContext): Filtering | null => {
		const req = ctx.switchToHttp().getRequest()
		const { filterBy, rule, startAt, endAt } = req.query

		const allowedFilters = ['date', 'category']

		if (!filterBy)
			throw new BadRequestException("Don't have filter param to sort")
		if (filterBy && !allowedFilters.includes(filterBy)) {
			throw new BadRequestException(
				`Invalid filterBy value: ${filterBy}. Allowed values are ${allowedFilters.join(', ')}`
			)
		}

		const isValidDate = (dateStr: string) => !isNaN(Date.parse(dateStr))
		if (startAt && !isValidDate(startAt)) {
			throw new BadRequestException(`Invalid startAt date: ${startAt}`)
		}
		if (endAt && !isValidDate(endAt)) {
			throw new BadRequestException(`Invalid endAt date: ${endAt}`)
		}

		return {
			filterBy: filterBy as string,
			rule: rule ? (rule as string) : undefined,
			startAt: startAt && isValidDate(startAt) ? startAt : undefined,
			endAt: endAt && isValidDate(endAt) ? endAt : undefined
		}
	}
)
