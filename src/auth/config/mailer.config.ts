import { MailerOptions } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config()

export const mailerConfig: MailerOptions = {
	transport: {
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS
		}
	},
	defaults: {
		from: '"Speak About It" <speakaboutit@gmail.com>'
	},
	template: {
		dir: path.join(process.cwd(), 'src', 'templates'),
		adapter: new HandlebarsAdapter(),
		options: {
			strict: true
		}
	}
}
