import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { getJwtConfig } from 'src/auth/config/jwt.config'
import { mailerConfig } from 'src/auth/config/mailer.config'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy'
import { JwtStrategy } from './strategy/jwt.strategy'

@Module({
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, JwtRefreshStrategy, PrismaService],
	imports: [
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule, MailerModule.forRoot(mailerConfig)],
			inject: [ConfigService],
			useFactory: getJwtConfig
		})
	]
})
export class AuthModule {}
