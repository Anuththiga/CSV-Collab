import { Router } from 'express';

import uploadFile from '../middlewares/upload.middleware';
import csvController from '../controllers/csv.controller';
import {
  getPost,
  updatePost
 } from '../controllers/post.controller';

const router = Router();

router.post(
  '/csv/upload',
  uploadFile.single('file'),
  csvController.upload
);
router.put('/posts/:id', updatePost);

router.get('/posts', getPost);

export default router;