import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { PrismaService } from './prisma/prisma.service'
import { UserModule } from './user/user.module'
import { PostsModule } from './posts/posts.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		AuthModule,
		PrismaModule,
		UserModule,
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'public/avatars'),
			serveRoot: '/avatars'
		}),
		PostsModule
	],
	controllers: [],
	providers: [PrismaService]
})
export class AppModule {}
