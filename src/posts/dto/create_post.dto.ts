import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString
} from 'class-validator'
import { Status } from 'prisma/prisma-client'

export class CreatePostDto {
	@ApiProperty({
		description: 'The title of the post',
		example: 'Understanding TypeScript Decorators'
	})
	@IsString()
	@IsNotEmpty()
	title: string

	@ApiProperty({
		description: 'The content of the post',
		example: 'This post explains TypeScript decorators in detail...'
	})
	@IsString()
	@IsNotEmpty()
	content: string

	@ApiProperty({
		description: 'A list of categories associated with the post',
		example: ['typescript', 'nestjs', 'backend'],
		type: [String]
	})
	@IsArray()
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	categories: string[]

	@ApiPropertyOptional({
		description: 'The status of the post',
		example: Status.ACTIVE,
		enum: Status
	})
	@IsEnum(Status)
	@IsOptional()
	status?: Status
}
