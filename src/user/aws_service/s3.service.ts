import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import {
	Injectable,
	InternalServerErrorException,
	Logger
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v4 as uuid } from 'uuid'

@Injectable()
export class S3Service {
	private s3Client: S3Client
	private readonly logger = new Logger(S3Service.name)

	constructor(private readonly configService: ConfigService) {
		this.s3Client = new S3Client({
			region: this.configService.get<string>('AWS_REGION'),
			credentials: {
				accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
				secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')
			}
		})
	}

	async deleteFileFromUrl(fileUrl: string): Promise<void> {
		if (fileUrl !== this.configService.get<string>('AWS_DEFAULT_IMAGE_URL')) {
			const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME')
			const region = this.configService.get<string>('AWS_REGION')

			const urlPrefix = `https://${bucketName}.s3.${region}.amazonaws.com/`
			if (!fileUrl.startsWith(urlPrefix)) {
				throw new InternalServerErrorException('Invalid file URL')
			}

			const fileKey = decodeURIComponent(fileUrl.replace(urlPrefix, ''))

			await this.deleteFile(fileKey)
		}
	}

	async deleteFile(fileKey: string): Promise<void> {
		const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME')

		try {
			const command = new DeleteObjectCommand({
				Bucket: bucketName,
				Key: fileKey
			})
			await this.s3Client.send(command)
		} catch (error) {
			throw new InternalServerErrorException(
				`Error deleting file from S3: ${error.message}`
			)
		}
	}

	async uploadFile(file: Express.Multer.File): Promise<string> {
		if (!file || !file.buffer) {
			throw new InternalServerErrorException('File buffer is undefined')
		}

		const fileKey = `${uuid()}-${file.originalname}`
		const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME')

		try {
			const upload = new Upload({
				client: this.s3Client,
				params: {
					Bucket: bucketName,
					Key: fileKey,
					Body: file.buffer,
					ContentType: file.mimetype
				}
			})

			await upload.done()

			const filePath = `https://${bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${encodeURIComponent(fileKey)}`
			return filePath
		} catch (error) {
			this.logger.error('Error uploading file to S3:', error)
			throw new InternalServerErrorException(
				`Error uploading file to S3: ${error.message}`
			)
		}
	}
}
