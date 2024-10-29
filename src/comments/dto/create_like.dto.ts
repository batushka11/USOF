import { Type } from '@prisma/client'
import { IsString } from 'class-validator'

export class CreateLikeDto {
	@IsString()
	type: Type
}
