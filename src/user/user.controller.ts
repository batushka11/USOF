import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UploadedFile,
	UseFilters,
	UseGuards,
	UseInterceptors,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Role, User } from '@prisma/client'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import {
	Pagination,
	PaginationParams
} from 'src/pagination/pagination_params.decorator'
import { Auth } from '../auth/decorators/auth.decorator'
import { Roles } from './decorators/role.decorator'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { HttpExceptionFilter } from './filter/http-exception.filter'
import { RolesGuard } from './guards/role.guard'
import { UserService } from './user.service'
import { avatarFileInterceptor } from './util/file-upload.util'

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Auth()
	@Get()
	async getUsers(@PaginationParams() paginationParams: Pagination) {
		return this.userService.getAllUsers(paginationParams)
	}

	@Auth()
	@Get('/:id')
	async getUser(@Param('id', ParseIntPipe) id: number) {
		return this.userService.getUserById(id)
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@Roles(Role.ADMIN)
	@Post()
	async addUser(@Body() dto: CreateUserDto) {
		return this.userService.createUser(dto)
	}

	@Auth()
	@Patch('/avatar')
	@UseInterceptors(avatarFileInterceptor())
	@UseFilters(new HttpExceptionFilter())
	async addAvatar(
		@CurrentUser('id') id: number,
		@UploadedFile() file: Express.Multer.File
	) {
		const filePath = `/avatars/${file.filename}`
		return this.userService.updateUserAvatar(id, filePath)
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@Patch('/:id')
	async updateUserInfo(
		@Body() dto: UpdateUserDto,
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: User
	) {
		return this.userService.updateUser(id, dto, user)
	}

	@Auth()
	@Delete('/:id')
	async deleteUser(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: User
	) {
		return this.userService.removeById(id, user)
	}
}
