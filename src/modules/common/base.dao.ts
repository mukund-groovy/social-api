import {
  Model,
  Document,
  FilterQuery,
  PipelineStage,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';

export abstract class BaseDAO<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  // Find all items with a filter
  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  // Find one item by filter

  async findOne(
    filter: FilterQuery<T>,
    projection?: Record<string, any>,
    options?: QueryOptions,
  ): Promise<T | null> {
    return this.model.findOne(filter, projection, options).exec();
  }

  // Find by ID
  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  // Create a new item
  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return document.save();
  }

  //Find by id and update document
  async findByIdAndUpdate(
    id: string,
    update: UpdateQuery<T>,
    projection: Record<string, any> = {},
    options?: QueryOptions,
  ): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, update, {
        new: true,
        projection,
        ...options,
      })
      .exec();
  }

  // Find record by id and delete
  async findByIdAndDelete(
    id: string,
    select: Record<string, any> = {},
  ): Promise<T | null> {
    return this.model.findByIdAndDelete(id, select).exec();
  }

  // Count the number of documents that match the filter
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  // Aggregate results based on an aggregation pipeline
  async aggregate(pipeline: PipelineStage[]): Promise<T[]> {
    return this.model.aggregate(pipeline).exec();
  }

  // Find one item and update it at the same time
  async findOneAndUpdate(
    filter: FilterQuery<T>,
    updateData: Partial<T>,
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filter, updateData, { new: true })
      .exec();
  }

  // Find one item and delete it
  async findOneAndDelete(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOneAndDelete(filter).exec();
  }

  // Soft delete by setting a 'deleted' flag
  async softDelete(filter: FilterQuery<T>): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filter, { deleted: true }, { new: true })
      .exec();
  }

  // Paginate results with a limit and skip
  async paginate(
    filter: FilterQuery<T> = {},
    limit: 10,
    skip: 0,
  ): Promise<T[]> {
    return this.model.find(filter).skip(skip).limit(limit).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    return this.model.exists(filter).then((res) => !!res);
  }
}
