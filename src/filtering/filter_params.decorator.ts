import {
	BadRequestException,
	createParamDecorator,
	ExecutionContext
} from '@nestjs/common'
import { Request } from 'express'
import { ParsedQs } from 'qs'
import { Filtering } from './filter.interface'
import { FilterRule } from './filter.rule'

export const FilteringParams = createParamDecorator(
	(data: string[], ctx: ExecutionContext): Filtering[] => {
		const req: Request = ctx.switchToHttp().getRequest()
		const filters: string[] = ([] as (string | ParsedQs)[])
			.concat(req.query.filter)
			.filter((filter): filter is string => typeof filter === 'string')

		if (!filters || filters.length === 0) return null

		return filters.map(filter => {
			if (
				!filter.match(
					/^[a-zA-Z0-9_]+:(eq|neq|gt|gte|lt|lte|like|nlike|in|nin):[a-zA-Z0-9_,]+$/
				) &&
				!filter.match(/^[a-zA-Z0-9_]+:(isnull|isnotnull)$/)
			) {
				throw new BadRequestException('Invalid filter format')
			}

			const [properties, rule, value] = filter.split(':')

			if (!data.includes(properties)) {
				throw new BadRequestException(`Invalid filter property: ${properties}`)
			}
			if (!Object.values(FilterRule).includes(rule as FilterRule)) {
				throw new BadRequestException(`Invalid filter rule: ${rule}`)
			}

			return { properties, rule, value }
		})
	}
)
