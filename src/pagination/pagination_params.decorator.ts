import {
	BadRequestException,
	createParamDecorator,
	ExecutionContext
} from '@nestjs/common'
import { Request } from 'express'
import { Pagination } from './pagination.interface'

export const PaginationParams = createParamDecorator(
	(data, ctx: ExecutionContext): Pagination => {
		const req: Request = ctx.switchToHttp().getRequest()

		const page = parseInt(req.query.page as string) || 1
		const size = parseInt(req.query.size as string) || 10

		if (page < 1 || size < 1) {
			throw new BadRequestException('Invalid pagination params')
		}

		if (size > 20) {
			throw new BadRequestException('Invalid pagination params: Max size is 20')
		}

		const limit = size
		const offset = (page - 1) * limit

		return { page, limit, size, offset }
	}
)
export { Pagination }
