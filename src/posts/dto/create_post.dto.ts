import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString
} from 'class-validator'
import { Status } from 'prisma/prisma-client'

export class CreatePostDto {
	@IsString()
	@IsNotEmpty()
	title: string

	@IsString()
	@IsNotEmpty()
	content: string

	@IsArray()
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	categories: string[]

	@IsEnum(Status)
	@IsOptional()
	status?: Status
}
