/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import axios from 'axios';
import { config } from '../config/config';
import logger from '../utils/logger';

export class ImageBucketService {
  private static instance: ImageBucketService;

  static getInstance(): ImageBucketService {
    if (!ImageBucketService.instance) {
      ImageBucketService.instance = new ImageBucketService();
    }
    return ImageBucketService.instance;
  }

  async uploadBase64Image(base64Image: string): Promise<string> {
    try {
      if (!this.isValidBase64Image(base64Image)) {
        throw new Error('Invalid base64 image format.');
      }

      const base64 = base64Image.split(',')[1];
      if (!base64 || base64.length < 100) {
        throw new Error('Base64 image data is too short.');
      }

      const form = new URLSearchParams();
      form.append('image', base64);

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${config.imageApiKey}`,
        form.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      logger.info('Image uploaded successfully.');
      return response?.data?.data?.image?.url;
    } catch (err: any) {
      logger.error(
        'Error in uploadBase64Image:',
        err?.response?.data?.error?.message || err.message,
      );
      throw new Error(`Image upload failed: ${err?.response?.data?.error?.message || err.message}`);
    }
  }

  isValidBase64Image(base64: string): boolean {
    const regex = /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+={0,2}$/;
    return regex.test(base64);
  }
}
