
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const { method, url, body, query, params } = request;
        const now = Date.now();

        this.logger.log(`[Request] ${method} ${url}`);
        // Be careful logging sensitive data in production!
        if (Object.keys(body).length > 0) {
            this.logger.debug(`[Body] ${JSON.stringify(body)}`);
        }

        return next.handle().pipe(
            tap(() => {
                const response = ctx.getResponse();
                const statusCode = response.statusCode;
                this.logger.log(
                    `[Response] ${method} ${url} ${statusCode} - ${Date.now() - now}ms`,
                );
            }),
        );
    }
}
