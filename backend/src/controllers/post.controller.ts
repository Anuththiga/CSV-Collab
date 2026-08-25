import { Request, Response } from 'express';
import Post from '../models/post.model.js';

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

    const offset = (page - 1) * limit;
    const { rows, count } = await Post.findAndCountAll({
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
            totalPage: Math.ceil(count / limit),
        },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Failed to retrieve posts.';

    res.status(500).json({
      message,
    });
  }
};

export default getPost;