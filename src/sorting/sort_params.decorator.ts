import {
	BadRequestException,
	createParamDecorator,
	ExecutionContext
} from '@nestjs/common'
import { Request } from 'express'
import { Sorting } from './sort.interface'

export const SortingParams = createParamDecorator(
	(data, ctx: ExecutionContext): Sorting | null => {
		const req: Request = ctx.switchToHttp().getRequest()
		const sortBy = req.query.sortBy as string
		const direction = (req.query.order as string) || 'desc'
		if (!sortBy) {
			return { sortBy: 'rating', order: 'desc' }
		}

		const allowedSorts = ['publishAt', 'rating', 'title']

		if (sortBy && !allowedSorts.includes(sortBy)) {
			throw new BadRequestException(
				`Invalid sortBy value: ${sortBy}. Allowed values are ${allowedSorts.join(', ')}`
			)
		}

		if (direction !== 'asc' && direction !== 'desc') {
			throw new BadRequestException(`Invalid sort direction: ${direction}`)
		}

		return { sortBy, order: direction as 'asc' | 'desc' }
	}
)
