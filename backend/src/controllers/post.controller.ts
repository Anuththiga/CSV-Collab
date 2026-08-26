import { Request, Response } from 'express';
import Post from '../models/post.model.js';
import { Op } from 'sequelize';
import { getIO } from '../socket.js';

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

const updatePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const {
      name,
      email,
      version
    } = req.body;

    if (!Number.isInteger(id)) {
      res.status(400).json({
        message: 'Invalid post ID.',
      });
      return;
    }

    const post = await Post.findByPk(id);

    if (!post) {
      res.status(404).json({
        message: 'Post not found.',
      });

      return;
    }

    if (post.version !== version) {
      res.status(409).json({
        message: 'Conflict detected. This post was already updated.',
        conflict: true,
        data: {
          current: post,
          requested: {
            name,
            email,
            version,
          },
        },
      });

      return;
    }

    if (name !== undefined) {
      post.name = name;
    }

    if (email !== undefined) {
      post.email = email;
    }

    post.version += 1;
    post.updatedBy = 'user';

    await post.save();
    getIO().emit('post:updated', {
      id: post.id,
      name: post.name,
      email: post.email,
      version: post.version,
      updatedBy: post.updatedBy,
    });

    res.status(200).json({
      message: 'Post updated successfully.',
      data: post,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to update post';

    res.status(500).json({
      message,
    });
  }
};

export {
  updatePost,
  getPost
}