import { ApiProperty } from '@nestjs/swagger'
import { Type } from '@prisma/client'
import { IsEnum, IsString } from 'class-validator'

export class CreateLikeDto {
	@ApiProperty({
		enum: Type,
		description:
			'The type of like, which must be one of the values from the Type enumeration.',
		example: Type.LIKE
	})
	@IsString()
	@IsEnum(Type)
	type: Type
}
