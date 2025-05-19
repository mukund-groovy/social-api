import { BaseService } from './base.service';
import { BaseDAO } from './base.dao';
import { Document } from 'mongoose';
import { ContextService } from 'src/common/context/context.service';
import { User } from '../user/entities/user.schema';
import { Inject, NotFoundException } from '@nestjs/common';
import { messages } from 'src/message.config';
import { ModuleRef } from '@nestjs/core';

export abstract class CommonService<T extends Document> extends BaseService<T> {
  private contextService?: ContextService;

  @Inject(ModuleRef)
  private readonly moduleRef: ModuleRef;

  constructor(protected override readonly dao: BaseDAO<T>) {
    super(dao);
  }

  async getUser() {
    return await super.findAll();
  }

  // Lazy load ContextService from ModuleRef (NestJS DI container)
  protected get context(): ContextService | undefined {
    if (!this.contextService && this.moduleRef) {
      this.contextService = this.moduleRef.get(ContextService, {
        strict: false,
      });
    }
    return this.contextService;
  }

  async getCurrentUser(): Promise<User> {
    const user = this.context.getUser();
    if (!user) throw new NotFoundException(messages.USER_NOT_FOUND);
    return user;
  }

  // add more shared helpers as needed
}
