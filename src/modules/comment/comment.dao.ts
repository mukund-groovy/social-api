import { Model } from 'mongoose';
import { getEnv } from '@utils/env.util';
import { Injectable } from '@nestjs/common';
import { BaseDAO } from '../common/base.dao';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './entities/comment.entity';

const LIMIT = 20;

@Injectable()
export class CommentDAO extends BaseDAO<CommentDocument> {
  constructor(
    @InjectModel(Comment.name)
    readonly commentModel: Model<CommentDocument>,
  ) {
    super(commentModel);
  }

  async getCommentList(param: any) {
    const { match, limit = LIMIT } = param;
    const getImageUrl = getEnv<string>('IMAGE_URL') || '';

    const aggregationPipeline: any = [
      {
        $match: match,
      },
      { $sort: { _id: -1 } },
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
        $lookup: {
          from: 'comments',
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
          from: 'users',
          localField: 'totalReply.userId',
          foreignField: 'userId',
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
                            '$replyUserInfo.userId',
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
    ];

    return await this.commentModel.aggregate(aggregationPipeline);
  }
}
