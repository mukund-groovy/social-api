// queue/job.interfaces.ts

export interface CreatePostJobData {
  type: 'create';
  userId: string;
  description: string;
  media?: [];
  [key: string]: any;
}

export interface UpdatePostJobData {
  type: 'update';
  postId: string;
  description?: string;
  media?: [];
  [key: string]: any;
}

export interface DeletePostJobData {
  type: 'delete';
  postId: string;
  [key: string]: any;
}

export type PostJobData =
  | CreatePostJobData
  | UpdatePostJobData
  | DeletePostJobData;
