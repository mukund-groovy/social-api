import { ObjectId } from 'mongodb';

export function ObjectID(id: string): any {
  return new ObjectId(id);
}

export function isValidObjectID(id: string): boolean {
  return ObjectId.isValid(id);
}
