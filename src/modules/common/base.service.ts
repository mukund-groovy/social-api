import { DeleteOptions, UpdateOptions } from 'mongodb';
import { BaseDAO } from '../common/base.dao';
import {
  FilterQuery,
  PipelineStage,
  Document,
  UpdateQuery,
  QueryOptions,
} from 'mongoose';

export abstract class BaseService<T extends Document> {
  constructor(protected readonly dao: BaseDAO<T>) {}

  // Find all items with an optional filter
  async findAll(
    filter: FilterQuery<T> = {},
    projection?: Record<string, any>,
    options?: QueryOptions,
  ): Promise<T[]> {
    return this.dao.findAll(filter, projection, options);
  }

  // Find one item by filter
  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.dao.findOne(filter);
  }

  // Find an item by its ID
  async findById(id: string): Promise<T | null> {
    return this.dao.findById(id);
  }

  // Create a new item
  async create(data: Partial<T>): Promise<T> {
    return this.dao.create(data);
  }

  //Find by id and update document
  async findByIdAndUpdate(
    id: string,
    update: UpdateQuery<T>,
    projection: Record<string, any> = {},
    options?: QueryOptions,
  ): Promise<T | null> {
    return this.dao.findByIdAndUpdate(id, update, {
      new: true,
      projection,
      ...options,
    });
  }

  // Find record by id and delete
  async findByIdAndDelete(
    id: string,
    select: Record<string, any> = {},
  ): Promise<T | null> {
    return this.dao.findByIdAndDelete(id, select);
  }

  async deleteMany(filter: FilterQuery<T>) {
    return this.dao.deleteMany(filter);
  }

  // Count the number of documents that match the filter
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.dao.count(filter);
  }

  // Aggregate results based on an aggregation pipeline
  async aggregate(pipeline: PipelineStage[]): Promise<T[]> {
    return this.dao.aggregate(pipeline);
  }

  // Find one item and update it at the same time
  async findOneAndUpdate(
    filter: FilterQuery<T>,
    updateData: Partial<T>,
  ): Promise<T | null> {
    return this.dao.findOneAndUpdate(filter, updateData);
  }

  // Find one item and delete it
  async findOneAndDelete(filter: FilterQuery<T>): Promise<T | null> {
    return this.dao.findOneAndDelete(filter);
  }

  // Update many documents same time
  async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>) {
    return this.dao.updateMany(filter, update);
  }

  // Soft delete by setting a 'deleted' flag (instead of actually deleting the document)
  async softDelete(filter: FilterQuery<T>): Promise<T | null> {
    return this.dao.softDelete(filter);
  }

  // Paginate results with a limit and offset (skip + limit)
  async paginate(
    filter: FilterQuery<T> = {},
    limit: 10,
    skip: 0,
  ): Promise<T[]> {
    return this.dao.paginate(filter, limit, skip);
  }

  //Update one document at a time
  async updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: UpdateOptions,
  ) {
    return this.dao.updateOne(filter, update, options);
  }

  //Delete one document at a time
  async deleteOne(filter: FilterQuery<T>, options?: DeleteOptions) {
    return this.dao.deleteOne(filter, options);
  }

  async countDocuments(filter: FilterQuery<T> = {}): Promise<number> {
    return this.dao.countDocuments(filter);
  }
}
