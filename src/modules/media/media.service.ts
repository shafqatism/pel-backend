import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: any): Promise<string> {
    const filename = `${uuidv4()}-${file.filename}`;
    const filePath = path.join(this.uploadDir, filename);

    const writeStream = fs.createWriteStream(filePath);
    await new Promise((resolve, reject) => {
      file.file.pipe(writeStream);
      file.file.on('end', resolve);
      file.file.on('error', reject);
    });

    // In a real scenario, this would return a public URL or S3 key
    return `/uploads/${filename}`;
  }
}
