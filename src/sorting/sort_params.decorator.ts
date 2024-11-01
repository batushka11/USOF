import {
	BadRequestException,
	createParamDecorator,
	ExecutionContext
} from '@nestjs/common'
import { Request } from 'express'
import { Sorting } from './sort.interface'

export const SortingParams = createParamDecorator(
	(validParams: string[], ctx: ExecutionContext): Sorting | null => {
		const req: Request = ctx.switchToHttp().getRequest()
		const property = req.query.property as string
		const direction = (req.query.direction as string) || 'desc'
		if (!property) {
			return { property: 'like', direction: 'desc' }
		}

		if (!validParams.includes(property)) {
			throw new BadRequestException(`Invalid sort property: ${property}`)
		}

		if (direction !== 'asc' && direction !== 'desc') {
			throw new BadRequestException(`Invalid sort direction: ${direction}`)
		}

		return { property, direction: direction as 'asc' | 'desc' }
	}
)
