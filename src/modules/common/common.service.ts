import { BaseService } from './base.service';
import { BaseDAO } from './base.dao';
import { Document, FilterQuery } from 'mongoose';

export abstract class CommonService<T extends Document> extends BaseService<T> {
  constructor(protected override readonly dao: BaseDAO<T>) {
    super(dao);
  }

  async getUser() {
    return await super.findAll();
  }

  // add more shared helpers as needed
}
