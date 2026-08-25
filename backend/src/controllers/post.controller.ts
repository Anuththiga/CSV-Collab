import { Request, Response } from 'express';
import Post from '../models/post.model.js';

const getPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const posts = await Post.findAll({
      attributes: [
        'id',
        'postId',
        'name',
        'email',
        'pendingData',
        'version',
        'createdAt',
        'updatedAt',
        'updatedBy',
      ],
    });

    res.status(200).json(posts);
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'There was an error while retrieving posts from the database.';

    res.status(500).json({
      message,
    });
  }
};

export default getPost;