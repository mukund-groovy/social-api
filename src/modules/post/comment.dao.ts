import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseDAO } from '../common/base.dao';
import {
  PostComment,
  PostCommentDocument,
} from './entities/post-comment.entity';
import { getEnv } from '@config/env.util';

const SORT = { _id: -1 };
const perPage = 20;

@Injectable()
export class PostCommentDAO extends BaseDAO<PostCommentDocument> {
  constructor(
    @InjectModel(PostComment.name)
    readonly postCommentModel: Model<PostCommentDocument>,
  ) {
    super(postCommentModel);
  }

  async getCommentList(param: any): Promise<PostComment[] | number> {
    const {
      match,
      start_from = 1,
      per_page = perPage,
      sort = SORT,
      count = false,
    } = param;
    const getImageUrl = getEnv<string>('IMAGE_URL') || '';

    const aggregationPipeline: any = [
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
    ];

    if (!count) {
      aggregationPipeline.push(
        {
          $lookup: {
            from: 'post_comments',
            let: { parent: { $toString: '$_id' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$parentId', '$$parent'] },
                      { $ne: ['$isDeleted', true] },
                    ],
                  },
                },
              },
            ],
            as: 'totalReply',
          },
        },
        {
          $lookup: {
            from: 'user',
            localField: 'totalReply.userId',
            foreignField: '_id',
            as: 'replyUserInfo',
          },
        },
        {
          $set: {
            total_reply: {
              $map: {
                input: '$totalReply',
                in: {
                  $mergeObjects: [
                    '$$this',
                    {
                      user: {
                        $arrayElemAt: [
                          '$replyUserInfo',
                          {
                            $indexOfArray: [
                              '$replyUserInfo._id',
                              '$$this.userId',
                            ],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            comment: 1,
            user_id: '$userId',
            first_name: '$userInfo.firstName',
            last_name: '$userInfo.lastName',
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
            post_id: '$postId',
            parent_id: '$parentId',
            is_parent: {
              $cond: {
                if: { $eq: ['$parentId', '0'] },
                then: true,
                else: false,
              },
            },
            user_image: {
              $concat: [getImageUrl, 'user/', '$userInfo.image'],
            },
            createdAt: {
              $toLong: '$createdAt',
            },
            created_at: '$createdAt',
            updatedAt: 1,
            total_reply_count: { $size: '$total_reply' },
            total_reply: {
              $map: {
                input: '$total_reply',
                as: 'reply',
                in: {
                  _id: '$$reply._id',
                  first_name: '$$reply.user.firstName',
                  last_name: '$$reply.user.lastName',
                  display_name: {
                    $ifNull: [
                      '$$reply.user.displayName',
                      {
                        $concat: [
                          { $ifNull: ['$$reply.user.firstName', ''] },
                          ' ',
                          { $ifNull: ['$$reply.user.lastName', ''] },
                        ],
                      },
                    ],
                  },
                  user_image: {
                    $concat: [getImageUrl, 'user/', '$$reply.user.image'],
                  },
                  comment: '$$reply.comment',
                  video_name: '$$reply.name',
                  user_id: '$$reply.userId',
                  parent_id: '$$reply.parentId',
                  createdAt: {
                    $toLong: '$createdAt',
                  },
                  created_at: '$$reply.createdAt',
                  updatedAt: '$$reply.updatedAt',
                },
              },
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
      const countResult = await this.postCommentModel.aggregate([
        ...aggregationPipeline,
        { $count: 'total' },
      ]);

      return countResult.length > 0 ? countResult[0].total : 0;
    }
    const result = await this.postCommentModel.aggregate(aggregationPipeline);
    return result;
  }
}
