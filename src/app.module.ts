import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import path from 'path'
import { AdminModule } from './admin/admin.module'
import { AuthModule } from './auth/auth.module'
import { CategoriesModule } from './categories/categories.module'
import { CommentsModule } from './comments/comments.module'
import { PostsModule } from './posts/posts.module'
import { PrismaModule } from './prisma/prisma.module'
import { PrismaService } from './prisma/prisma.service'
import { S3Service } from './user/service/s3.service'
import { UserModule } from './user/user.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		AuthModule,
		PrismaModule,
		UserModule,
		ServeStaticModule.forRoot({
			rootPath: path.join(process.cwd(), 'public', 'avatars'),
			serveRoot: '/avatars'
		}),
		PostsModule,
		CategoriesModule,
		CommentsModule,
		AdminModule
	],
	controllers: [],
	providers: [PrismaService, S3Service]
})
export class AppModule {}
