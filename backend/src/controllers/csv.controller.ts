import { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { parse } from 'fast-csv';

import Post from '../models/post.model.js';

interface PostCsvRecord {
  postId: string;
  name: string;
  email: string;
  pendingData?: string | null;
  version?: number;
  updatedBy: string;
}

const upload = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        message: 'Please upload a CSV file!',
      });
      return;
    }

    const rows: PostCsvRecord[] = [];

    const filePath =
      `./resources/static/assets/uploads/${req.file.filename}`;

    createReadStream(filePath)
      .pipe(parse({ headers: true }))
      .on('error', (error: Error) => {
        console.error('CSV parsing error:', error);

        if (!res.headersSent) {
          res.status(400).json({
            message: 'Failed to parse CSV file!',
            error: error.message,
          });
        }
      })
      .on('data', (row: PostCsvRecord) => {
        rows.push(row);
      })
      .on('end', async () => {
        try {
          const posts = rows.map((row) => ({
            postId: row.postId,
            name: row.name,
            email: row.email,
            pendingData: row.pendingData ?? null,
            version: row.version ?? 1,
            updatedBy: row.updatedBy,
          }));

          await Post.bulkCreate(posts);

          res.status(200).json({
            message: `The file "${req.file?.originalname}" was uploaded successfully!`,
            recordsImported: posts.length,
          });
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : 'Unknown database error';

          res.status(500).json({
            message: "Couldn't import data into database.",
            error: message,
          });
        }
      });
  } catch (error: unknown) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to upload the CSV file!',
    });
  }
};

export default {
  upload,
};