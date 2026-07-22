/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import axios from 'axios';
import { config } from '../config/config';
import logger from '../utils/logger';

const ALLOWED_DOCUMENT_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const ALLOWED_DOCUMENT_EXTENSIONS = ['pdf', 'png', 'jpeg', 'jpg'];

export class SupabaseStorageService {
  private static instance: SupabaseStorageService;

  static getInstance(): SupabaseStorageService {
    if (!SupabaseStorageService.instance) {
      SupabaseStorageService.instance = new SupabaseStorageService();
    }

    return SupabaseStorageService.instance;
  }

  private get baseUrl() {
    const rawValue = config.supabaseUrl.trim().replace(/\/$/, '');

    if (/^https?:\/\//i.test(rawValue)) {
      return rawValue;
    }

    if (/^[a-z0-9-]+$/i.test(rawValue)) {
      return `https://${rawValue}.supabase.co`;
    }

    return rawValue;
  }

  private get bucketName() {
    return config.supabaseBucket;
  }

  private validateConfig() {
    if (!config.supabaseUrl?.trim()) {
      throw new Error('Missing SUPABASE_URL in backend environment.');
    }

    if (!config.supabaseServiceRoleKey?.trim()) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in backend environment.');
    }

    if (config.supabaseServiceRoleKey.includes('"role":"anon"')) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is using the anon key. Use the service_role key from Supabase settings.');
    }

    if (!config.supabaseBucket?.trim()) {
      throw new Error('Missing SUPABASE_BUCKET in backend environment.');
    }
  }

  private sanitizeFileName(fileName: string) {
    return (fileName || 'document')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .toLowerCase();
  }

  private getFileExtension(value?: string) {
    if (!value) {
      return '';
    }

    const cleanValue = value.split('?')[0].split('#')[0];
    return cleanValue.split('.').pop()?.toLowerCase() || '';
  }

  private validateSupportedMimeType(mimeType: string) {
    const normalizedMimeType = String(mimeType || '').toLowerCase();

    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(normalizedMimeType)) {
      throw new Error('Only PDF, PNG, and JPEG documents are allowed.');
    }
  }

  private validateSupportedUrl(documentUrl: string) {
    const extension = this.getFileExtension(documentUrl);

    if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(extension)) {
      throw new Error('Only PDF, PNG, and JPEG documents are allowed.');
    }
  }

  private encodeObjectPath(path: string) {
    return path
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/');
  }

  private extractDocumentParts(base64Document: string) {
    const matches = /^data:([^;]+);base64,(.+)$/i.exec(base64Document || '');

    if (!matches) {
      throw new Error('Invalid base64 document format.');
    }

    const mimeType = matches[1] || 'application/octet-stream';
    const base64Data = matches[2];
    if (!base64Data || base64Data.length < 16) {
      throw new Error('Base64 document data is too short.');
    }

    this.validateSupportedMimeType(mimeType);

    const extension = mimeType.split('/')[1]?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';

    return {
      mimeType,
      base64Data,
      extension,
    };
  }

  private buildPublicUrl(objectPath: string) {
    return `${this.baseUrl}/storage/v1/object/public/${this.bucketName}/${this.encodeObjectPath(objectPath)}`;
  }

  private extractObjectPathFromPublicUrl(documentUrl: string) {
    const publicPrefix = `${this.baseUrl}/storage/v1/object/public/${this.bucketName}/`;

    if (!documentUrl?.startsWith(publicPrefix)) {
      return null;
    }

    return documentUrl
      .slice(publicPrefix.length)
      .split('/')
      .map((part) => decodeURIComponent(part))
      .join('/');
  }

  async uploadBase64Document(base64Document: string): Promise<string> {
    try {
      this.validateConfig();

      if (/^https?:\/\//i.test(base64Document || '')) {
        this.validateSupportedUrl(base64Document);
        return base64Document;
      }

      const { mimeType, base64Data, extension } = this.extractDocumentParts(base64Document);
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
      const objectPath = `leave-documents/${this.sanitizeFileName(fileName)}`;
      const uploadUrl = `${this.baseUrl}/storage/v1/object/${this.bucketName}/${this.encodeObjectPath(objectPath)}`;
      const fileBuffer = Buffer.from(base64Data, 'base64');

      await axios.post(uploadUrl, fileBuffer, {
        headers: {
          apikey: config.supabaseServiceRoleKey,
          Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
          'Content-Type': mimeType,
          'x-upsert': 'false',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      logger.info('Document uploaded to Supabase successfully.');
      return this.buildPublicUrl(objectPath);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Unknown error';

      logger.error(`Error in uploadBase64Document: ${message}`);
      throw new Error(`Document upload failed: ${message}`);
    }
  }

  async uploadBase64Documents(documents: string[] = []): Promise<string[]> {
    const uploadedDocuments: string[] = [];

    for (const document of documents) {
      const uploadedUrl = await this.uploadBase64Document(document);
      uploadedDocuments.push(uploadedUrl);
    }

    return uploadedDocuments;
  }

  async removeDocument(documentUrl: string): Promise<void> {
    this.validateConfig();

    if (!/^https?:\/\//i.test(documentUrl || '')) {
      return;
    }

    const objectPath = this.extractObjectPathFromPublicUrl(documentUrl);

    if (!objectPath) {
      logger.info(`Skipping document deletion for non-Supabase URL: ${documentUrl}`);
      return;
    }

    const deleteUrl = `${this.baseUrl}/storage/v1/object/${this.bucketName}/${this.encodeObjectPath(objectPath)}`;

    await axios.delete(deleteUrl, {
      headers: {
        apikey: config.supabaseServiceRoleKey,
        Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      },
    });
  }

  async removeDocuments(documents: string[] = []): Promise<void> {
    for (const document of documents) {
      await this.removeDocument(document);
    }
  }
}
