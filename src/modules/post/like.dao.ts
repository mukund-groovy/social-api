import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseDAO } from '../common/base.dao';
import { PostLike, PostLikeDocument } from './entities/post-like.entity';
import { getEnv } from '@utils/env.util';

const SORT = { _id: -1 };
const perPage = 20;
@Injectable()
export class PostLikeDAO extends BaseDAO<PostLikeDocument> {
  constructor(
    @InjectModel(PostLike.name) readonly postLikeModel: Model<PostLikeDocument>,
  ) {
    super(postLikeModel);
  }

  async getLikeUserList(
    param: any,
  ): Promise<
    { type: 'count'; data: number } | { type: 'list'; data: PostLikeDocument[] }
  > {
    const {
      match,
      start_from = 1,
      per_page = perPage,
      sort = SORT,
      count = false,
    } = param;
    const getImageUrl = getEnv<string>('IMAGE_URL') || '';

    const aggregationPipeline: any = [
      {
        $match: match,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
    ];

    if (!count) {
      aggregationPipeline.push(
        {
          $project: {
            _id: 1,
            user_name: {
              $concat: [
                { $ifNull: ['$userInfo.firstName', ''] },
                ' ',
                { $ifNull: ['$userInfo.lastName', ''] },
              ],
            },
            display_name: {
              $ifNull: [
                '$userInfo.displayName',
                {
                  $concat: [
                    { $ifNull: ['$userInfo.firstName', ''] },
                    ' ',
                    { $ifNull: ['$userInfo.lastName', ''] },
                  ],
                },
              ],
            },
            createdAt: 1,
            user_image: {
              $concat: [getImageUrl, 'user/', '$userInfo.image'],
            },
          },
        },
        { $sort: sort },
        { $skip: start_from },
        { $limit: per_page },
      );
    }

    if (count) {
      // If count is true, return the count
      const countResult = await this.postLikeModel.aggregate([
        ...aggregationPipeline,
        { $count: 'total' },
      ]);

      return { type: 'count', data: countResult?.[0]?.total || 0 };
    }

    const result = await this.postLikeModel.aggregate(aggregationPipeline);
    return { type: 'list', data: result };
  }
}
