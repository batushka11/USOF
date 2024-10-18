import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { Auth } from '../auth/decorators/auth.decorator'
import { Roles } from './decorators/role.decorator'
import { AvatarDto } from './dto/avatar.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { RolesGuard } from './guards/role.guard'
import { UserService } from './user.service'

@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Auth()
	@Get()
	async getUsers() {
		return this.userService.getAllUsers()
	}

	@Auth()
	@Get('/:id')
	async getUser(@Param('id', ParseIntPipe) id: number) {
		return this.userService.getUserById(id)
	}

	@Auth()
	@Roles(Role.ADMIN)
	@Post()
	async addUser(@Body() dto: CreateUserDto) {
		return this.userService.createUser(dto)
	}

	@Auth()
	@Patch('/avatar')
	async addAvatar(@CurrentUser('id') id: number, @Body() avatarDto: AvatarDto) {
		return this.userService.updateUserAvatar(id, avatarDto.path)
	}

	@Auth()
	@Patch('/:id')
	async updateUserInfo(@Body() dto: UpdateUserDto, @Param('id') id: number) {
		return this.userService.updateUser(id, dto)
	}

	@Auth()
	@Delete('/:id')
	async deleteUser(@Param('id', ParseIntPipe) id: number) {
		return this.userService.removeById(id)
	}
}
