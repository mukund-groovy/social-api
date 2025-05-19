import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseDAO } from '../common/base.dao';
import { Like, LikeDocument } from './entities/like.entity';
import { getEnv } from '@utils/env.util';
const LIMIT = 10;
@Injectable()
export class LikeDAO extends BaseDAO<LikeDocument> {
  constructor(@InjectModel(Like.name) readonly likeModel: Model<LikeDocument>) {
    super(likeModel);
  }

  async getLikeUserList(param: any) {
    const { match, limit = LIMIT } = param;
    const getImageUrl = getEnv<string>('IMAGE_URL') || '';

    const aggregationPipeline: any = [
      {
        $match: match,
      },
      { $sort: { _id: 1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'userId',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
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
          likedAt: '$createdAt',
          user_image: {
            $concat: [getImageUrl, 'user/', '$userInfo.image'],
          },
        },
      },
    ];

    return await this.likeModel.aggregate(aggregationPipeline);
  }
}
