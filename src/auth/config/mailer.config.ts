import { MailerOptions } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'

export const mailerConfig: MailerOptions = {
	transport: {
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: 'zhupanovandrey05@gmail.com',
			pass: 'zuiy lnly scyz kxye'
		}
	},
	defaults: {
		from: '"Speak About It" <speakaboutit@gmail.com>'
	},
	template: {
		dir: __dirname,
		adapter: new HandlebarsAdapter(),
		options: {
			strict: true
		}
	}
}
