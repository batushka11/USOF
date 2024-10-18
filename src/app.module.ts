import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { PrismaService } from './prisma/prisma.service'
import { UserModule } from './user/user.module'

@Module({
	imports: [ConfigModule.forRoot(), AuthModule, PrismaModule, UserModule],
	controllers: [],
	providers: [PrismaService]
})
export class AppModule {}
