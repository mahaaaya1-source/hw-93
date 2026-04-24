import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import * as fs from 'fs';

export const createMulterOptions = (folderName: string) => ({
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      const uploadPath = join(process.cwd(), 'public', 'uploads', folderName);

      fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const extension = extname(file.originalname);
      cb(null, randomUUID() + extension);
    },
  }),
});