import fs from 'fs';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const dir = './resources/static/assets/uploads';

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const csvFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const isCsv = file.originalname
    .toLowerCase()
    .endsWith('.csv');

  if (isCsv) {
    cb(null, true);
  } else {
    cb(
      new Error('Please upload only CSV files.')
    );
  }
};

export default multer({
  storage,
  fileFilter: csvFilter,
});