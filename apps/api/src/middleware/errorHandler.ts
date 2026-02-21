import type { NextFunction, Request, Response } from 'express';
import type { MulterError } from 'multer';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  if (err && typeof err === 'object' && 'code' in err) {
    const multerErr = err as MulterError;
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      return;
    }
    if (multerErr.code === 'LIMIT_UNEXPECTED_FILE' || multerErr.message?.includes('image')) {
      res.status(400).json({ message: multerErr.message || 'Invalid file' });
      return;
    }
  }
  res.status(500).json({ message: 'Internal server error' });
}
