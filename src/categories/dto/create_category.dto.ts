import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateCategoryDto {
	@ApiProperty({
		description: 'Title of the category',
		example: 'Technology'
	})
	@IsString()
	title: string

	@ApiProperty({
		description: 'Description of the category',
		example: 'All about the latest in technology and gadgets.'
	})
	@IsString()
	description: string
}
