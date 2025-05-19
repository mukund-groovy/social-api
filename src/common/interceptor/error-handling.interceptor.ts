// src/interceptors/error-handling.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { isArray } from '@utils/lodash.util';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        // Ensure the message is a string, extracting it properly from error response
        const message =
          error instanceof HttpException
            ? this.formatErrorMessage(error.getResponse())
            : error.message || 'Internal server error';

        // Log the error for debugging (optional)
        console.error('Error intercepted:', {
          path: request.url,
          method: request.method,
          message,
          stack: error.stack,
        });

        // Return the error response with a standardized message
        response.status(status).json({
          success: false,
          statusCode: status,
          message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });

        return throwError(() => error);
      }),
    );
  }

  // Ensures message is a string in case of structured error responses
  private formatErrorMessage(response: any): string {
    if (typeof response === 'object' && response?.message) {
      if (typeof response.message === 'string') {
        return response.message;
      } else if (isArray(response.message)) {
        return response.message[0];
      } else {
        return 'An unexpected error occurred';
      }
    }
    return 'An unexpected error occurred';
  }
}
