import { PartialType } from '@nestjs/mapped-types'
import { CreatePostDto } from './create_post.dto'

export class UpdatePostDto extends PartialType(CreatePostDto) {}
