import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { S3Service } from './aws_service/s3.service'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
	controllers: [UserController],
	providers: [UserService, PrismaService, S3Service]
})
export class UserModule {}
