import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response: any = { success: true };

        if (data && typeof data === 'object') {
          if ('message' in data) {
            response.message = data.message;
          }
          if ('data' in data) {
            response.data = data.data;
          } else if (Object.keys(data).length > 0 && !('message' in data)) {
            response.data = data;
          }
        } else if (data !== undefined && data !== null) {
          response.data = data;
        }

        return response;
      }),
    );
  }
}
