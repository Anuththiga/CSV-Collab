import { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { parse } from 'fast-csv';

import Post from '../models/post.model.js';

interface PostCsvRecord {
  id: number;
  postId: number;
  name: string;
  email: string;
}

const REQUIRED_HEADERS = [
  'id',
  'postId',
  'name',
  'email',
];

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

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

    const file = req.file;

    const rows: Record<string, string>[] = [];

    let csvHeaders: string[] = [];

    const filePath =
      `./resources/static/assets/uploads/${file.filename}`;

    // 2. Read and parse CSV
    createReadStream(filePath)
      .pipe(
        parse({
          headers: true,
          ignoreEmpty: true,
        })
      )
      .on('headers', (headers: string[]) => {
        csvHeaders = headers;
      })
      .on('error', (error: Error) => {
        console.error(
          'CSV parsing error:',
          error
        );

        if (!res.headersSent) {
          res.status(400).json({
            message: 'Failed to parse CSV file!',
            error: error.message,
          });
        }
      })
      .on(
        'data',
        (row: Record<string, string>) => {
          rows.push(row);
        }
      )

      // After CSV has been completely read
      .on('end', async () => {
        try {
          const errors: string[] = [];

          // Validate CSV headers

          for (const header of REQUIRED_HEADERS) {
            if (!csvHeaders.includes(header)) {
              errors.push(
                `Missing required column: ${header}`
              );
            }
          }

          // Stop if headers are invalid
          if (errors.length > 0) {
            res.status(400).json({
              message: 'Invalid CSV headers.',
              errors,
            });

            return;
          }

          const ids = new Set<number>();

          const posts: PostCsvRecord[] = [];

          rows.forEach((row, index) => {
            // CSV header is row 1, therefore data starts at row 2.
            const rowNumber = index + 2;

            const id = Number(row.id);
            const postId = Number(row.postId);
            const name = row.name?.trim();
            const email = row.email?.trim();

            // Validate ID
            if (!Number.isInteger(id)) {
              errors.push(
                `Row ${rowNumber}: id must be an integer.`
              );
            }

            if (Number.isInteger(id)) {
              if (ids.has(id)) {
                errors.push(
                  `Row ${rowNumber}: duplicate id ${id}.`
                );
              }

              ids.add(id);
            }

            // Validate postId
            if (!Number.isInteger(postId)) {
              errors.push(
                `Row ${rowNumber}: postId must be an integer.`
              );
            }

            // Validate name
            if (!name) {
              errors.push(
                `Row ${rowNumber}: name is required.`
              );
            }

            // Validate email
            if (!email) {
              errors.push(
                `Row ${rowNumber}: email is required.`
              );
            } else if (!isValidEmail(email)) {
              errors.push(
                `Row ${rowNumber}: invalid email.`
              );
            }

            posts.push({
              id,
              postId,
              name,
              email,
            });
          });

          // Stop if validation failed

          if (errors.length > 0) {
            res.status(400).json({
              message: 'CSV validation failed.',
              errors,
            });

            return;
          }

          // Convert CSV records to database records

          const databasePosts = posts.map((post) => ({
            id: post.id,
            postId: post.postId,
            name: post.name,
            email: post.email,
            pendingData: null,
            version: 1,
            updatedBy: 'admin',
          }));

          // Insert into PostgreSQL

          await Post.bulkCreate(databasePosts);

          // Success response

          res.status(200).json({
            message:
              `The file "${file.originalname}" ` +
              'was uploaded successfully!',

            recordsImported:
              databasePosts.length,
          });
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : 'Unknown database error';

          console.error('Database insertion error:', error);

          if (!res.headersSent) {
            res.status(500).json({
              message:
                "Couldn't import data into database.",

              error: message,
            });
          }
        }
      });
  } catch (error: unknown) {
    console.error(
      'Upload error:',
      error
    );

    if (!res.headersSent) {
      res.status(500).json({
        message:
          'Failed to upload the CSV file!',
      });
    }
  }
};

export default {
  upload,
};