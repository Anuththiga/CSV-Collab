import { Request, Response } from 'express';
import Post from '../models/post.model.js';
import { Op } from 'sequelize';

const getPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
        Math.max(Number(req.query.limit) || 10, 1),
        100
    );

    const search =
      typeof req.query.search === 'string'
        ? req.query.search.trim()
        : '';

    const offset = (page - 1) * limit;

    const where = search
      ? {
          [Op.or]: [
            {
              name: {
                [Op.iLike]: `%${search}%`,
              },
            },
            {
              email: {
                [Op.iLike]: `%${search}%`,
              },
            },
            {
              postId: {
                [Op.iLike]: `%${search}%`,
              },
            },
          ],
        }
      : undefined;

    const { rows, count } =
      await Post.findAndCountAll({
        where,
        limit,
        offset,
        order: [['id', 'ASC']],
      });

    res.status(200).json({
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to retrieve posts';

    res.status(500).json({
      message,
    });
  }
};

export default getPost;