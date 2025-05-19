import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  user?: any; // You can type this more strictly as per your User type
}

@Injectable()
export class ContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

  run(context: RequestContext, callback: (...args: any[]) => void) {
    this.asyncLocalStorage.run(context, callback);
  }

  get<T = any>(key: keyof RequestContext): T | undefined {
    const store = this.asyncLocalStorage.getStore();
    return store?.[key];
  }

  getUser<T = any>(): T | undefined {
    return this.get('user');
  }
}
