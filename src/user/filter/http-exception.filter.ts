import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException
} from '@nestjs/common'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse()
		//const request = ctx.getRequest()

		const status = exception.getStatus()
		const errorResponse = exception.getResponse()

		const errorMessage =
			typeof errorResponse === 'string'
				? errorResponse
				: (errorResponse as any).message

		response.status(status).json({
			statusCode: status,
			// timestamp: new Date().toISOString(),
			// path: request.url,
			error: errorMessage
		})
	}
}
