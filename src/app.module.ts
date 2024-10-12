import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { PrismaService } from './prisma/prisma.service'

@Module({
	imports: [ConfigModule.forRoot(), AuthModule, PrismaModule],
	controllers: [],
	providers: [PrismaService]
})
export class AppModule {}
