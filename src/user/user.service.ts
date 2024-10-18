import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}
	async getAllUsers() {
		return this.prisma.user.findMany()
	}

	async getUserById(id: number) {
		return this.prisma.user.findUnique({
			where: {
				id: id
			}
		})
	}

	async createUser(dto: CreateUserDto) {
		return this.prisma.user.create({
			data: dto
		})
	}

	async updateUserAvatar(id: number, path: string) {
		return this.prisma.user.update({
			where: {
				id: id
			},
			data: {
				avatarPath: path
			}
		})
	}

	async updateUser(id: number, dto: UpdateUserDto) {
		return this.prisma.user.update({
			where: {
				id: id
			},
			data: dto
		})
	}

	async removeById(id: number) {
		return this.prisma.user.delete({
			where: {
				id: id
			}
		})
	}
}
