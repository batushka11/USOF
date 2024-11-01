import { HttpException, HttpStatus } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

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
		limits: {
			fileSize: 4 * 1024 * 1024
		},
		fileFilter: imageFileFilter
	})
}
