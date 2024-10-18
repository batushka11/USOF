import { IsNotEmpty, IsString } from 'class-validator'

export class AvatarDto {
	@IsNotEmpty()
	@IsString()
	path: string
}
