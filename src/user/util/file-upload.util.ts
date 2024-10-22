import { HttpException, HttpStatus } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { v4 as uuidv4 } from 'uuid'

const imageFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
	if (!file.mimetype.startsWith('image/')) {
		return cb(
			new HttpException(
				'Only image files are allowed!',
				HttpStatus.UNPROCESSABLE_ENTITY
			),
			false
		)
	}
	cb(null, true)
}

export const avatarFileInterceptor = () => {
	return FileInterceptor('file', {
		storage: diskStorage({
			destination: './public/avatars',
			filename: (req, file, cb) => {
				const randomName = uuidv4()
				cb(null, `${randomName}${extname(file.originalname)}`)
			}
		}),
		limits: {
			fileSize: 4 * 1024 * 1024
		},
		fileFilter: imageFileFilter
	})
}
