import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	app.setGlobalPrefix('api')
	app.enableCors()
	app.use(cookieParser())

	const config = new DocumentBuilder()
		.setTitle('Speak About It API')
		.setDescription(
			'APi documentation for the "Speak About It" forum, a platform for discussing various topics and issues.'
		)
		.setVersion('1.0')
		.addBearerAuth()
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('/api/docs', app, document)
	await app.listen(4200)
}
bootstrap()
