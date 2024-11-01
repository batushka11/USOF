import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Role } from '@prisma/client'
import { verify } from 'argon2'
import { PrismaModule } from 'src/prisma/prisma.module'
import { PrismaService } from 'src/prisma/prisma.service'

const authenticate = async (
	email: string,
	password: string,
	prisma: PrismaService
) => {
	const user = await prisma.user.findUnique({
		where: { email }
	})

	if (
		user &&
		(await verify(user.password, password)) &&
		user.role === Role.ADMIN
	) {
		return {
			email: user.email,
			id: user.id.toString()
		}
	}

	return null
}

@Module({
	imports: [
		ConfigModule.forRoot(),
		import('@adminjs/nestjs').then(async ({ AdminModule: AdminJsModule }) => {
			return AdminJsModule.createAdminAsync({
				useFactory: async (prisma: PrismaService) => {
					const AdminJS = (await import('adminjs')).default
					const { Database, Resource, getModelByName } = await import(
						'@adminjs/prisma'
					)

					AdminJS.registerAdapter({ Database, Resource })

					return {
						adminJsOptions: {
							rootPath: '/admin',
							resources: [
								{
									resource: {
										model: getModelByName('User'),
										client: prisma
									},
									options: {
										listProperties: [
											'id',
											'login',
											'email',
											'role',
											'rating',
											'isConfirm'
										],
										editProperties: [
											'login',
											'fullname',
											'email',
											'password',
											'role',
											'isConfirm'
										],
										showProperties: [
											'id',
											'login',
											'email',
											'role',
											'rating',
											'avatarPath',
											'isConfirm',
											'createdAt'
										],
										filterProperties: [
											'login',
											'fullname',
											'email',
											'role',
											'isConfirm',
											'rating',
											'createdAt'
										]
									}
								},
								{
									resource: {
										model: getModelByName('Post'),
										client: prisma
									},
									options: {
										listProperties: [
											'id',
											'title',
											'status',
											'publishAt',
											'user'
										],
										editProperties: ['title', 'content', 'user'],
										showProperties: [
											'id',
											'title',
											'content',
											'status',
											'publishAt',
											'user'
										],
										filterProperties: ['status', 'publishAt', 'title', 'user']
									}
								},
								{
									resource: {
										model: getModelByName('Category'),
										client: prisma
									},
									options: {
										listProperties: ['id', 'title', 'description', 'createdAt'],
										editProperties: ['title', 'description'],
										showProperties: ['id', 'title', 'description', 'createdAt'],
										filterProperties: ['title', 'createdAt']
									}
								},
								{
									resource: {
										model: getModelByName('Comment'),
										client: prisma
									},
									options: {
										listProperties: [
											'id',
											'content',
											'publishAt',
											'user',
											'post'
										],
										editProperties: ['content', 'user', 'post'],
										showProperties: [
											'id',
											'content',
											'publishAt',
											'user',
											'post'
										],
										filterProperties: ['publishAt', 'user', 'post']
									}
								},
								{
									resource: {
										model: getModelByName('Like'),
										client: prisma
									},
									options: {
										listProperties: [
											'id',
											'type',
											'publishAt',
											'user',
											'post',
											'comment'
										],
										editProperties: ['type', 'user', 'post', 'comment'],
										showProperties: [
											'id',
											'type',
											'publishAt',
											'user',
											'post',
											'comment'
										],
										filterProperties: ['type', 'publishAt', 'user']
									}
								}
							]
						},
						auth: {
							authenticate: (email, password) =>
								authenticate(email, password, prisma),
							cookieName: 'adminjs',
							cookiePassword: 'secret'
						},
						sessionOptions: {
							resave: true,
							saveUninitialized: true,
							secret: 'secret'
						}
					}
				},
				inject: [PrismaService],
				imports: [PrismaModule]
			})
		})
	],
	providers: [PrismaService]
})
export class AdminModule {}
