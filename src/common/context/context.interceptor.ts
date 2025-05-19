// src/common/context/request-context.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ContextService } from './context.service';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  constructor(private readonly contextService: ContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return new Observable((subscriber) => {
      this.contextService.run({ user }, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
