import { BaseService } from './base.service';
import { BaseDAO } from './base.dao';
import { Document, FilterQuery } from 'mongoose';

export abstract class CommonService<T extends Document> extends BaseService<T> {
  constructor(protected override readonly dao: BaseDAO<T>) {
    super(dao);
  }

  count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.dao.count(filter);
  }

  exists(filter: FilterQuery<T>): Promise<boolean> {
    return this.dao.exists(filter);
  }

  async getUser() {
    return this.findAll();
  }

  // add more shared helpers as needed
}
