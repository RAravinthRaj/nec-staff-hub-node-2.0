/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import Redis from 'ioredis';
import { config } from '../config/config';
import logger from '../utils/logger';
import { SupabaseStorageService } from './supabaseStorage.service';
import { OAAttendanceReportService, OAReportFilters } from './oaAttendanceReport.service';
import { MailService } from './mail.service';

interface LeaveDocumentCleanupJob {
  leaveId: number;
  documents: string[];
  attempt?: number;
}

interface OAAttendanceExportJob {
  email: string;
  userName: string;
  filters: OAReportFilters;
  attempt?: number;
}

const LEAVE_DOCUMENT_CLEANUP_QUEUE = 'queue:leave-document-cleanup';
const LEAVE_DOCUMENT_CLEANUP_DEAD_LETTER_QUEUE = 'queue:leave-document-cleanup:dead-letter';
const OA_ATTENDANCE_EXPORT_QUEUE = 'queue:oa-attendance-export';
const OA_ATTENDANCE_EXPORT_DEAD_LETTER_QUEUE = 'queue:oa-attendance-export:dead-letter';
const MAX_JOB_ATTEMPTS = 3;

export class ValkeyQueueService {
  private static instance: ValkeyQueueService;
  private producer: Redis | null = null;
  private workerStarted = false;

  static getInstance() {
    if (!ValkeyQueueService.instance) {
      ValkeyQueueService.instance = new ValkeyQueueService();
    }

    return ValkeyQueueService.instance;
  }

  private getConnectionOptions() {
    return {
      host: config.valKeyHost,
      port: Number(config.valKeyPort),
      username: config.valKeyUser || undefined,
      password: config.valKeyPassword || undefined,
      tls: config.valKeyHost ? {} : undefined,
      lazyConnect: true,
      maxRetriesPerRequest: null as null,
    };
  }

  private async getProducer() {
    if (!this.producer) {
      this.producer = new Redis(this.getConnectionOptions());
      this.producer.on('error', (err) => logger.error(`Valkey producer error: ${err}`));
    }

    if (this.producer.status !== 'ready') {
      await this.producer.connect();
    }

    return this.producer;
  }

  private async createConsumer(queueName: string) {
    const consumer = new Redis(this.getConnectionOptions());
    consumer.on('error', (err) => logger.error(`Valkey consumer error for ${queueName}: ${err}`));

    if (consumer.status !== 'ready') {
      await consumer.connect();
    }

    return consumer;
  }

  async enqueueLeaveDocumentCleanup(payload: LeaveDocumentCleanupJob) {
    const producer = await this.getProducer();

    await producer.rpush(
      LEAVE_DOCUMENT_CLEANUP_QUEUE,
      JSON.stringify({
        ...payload,
        attempt: payload.attempt ?? 1,
      }),
    );
  }

  async enqueueOAAttendanceExport(payload: OAAttendanceExportJob) {
    const producer = await this.getProducer();

    await producer.rpush(
      OA_ATTENDANCE_EXPORT_QUEUE,
      JSON.stringify({
        ...payload,
        attempt: payload.attempt ?? 1,
      }),
    );
  }

  async startWorkers() {
    if (this.workerStarted) {
      return;
    }

    this.workerStarted = true;
    void this.runLeaveDocumentCleanupWorker();
    void this.runOAAttendanceExportWorker();
  }

  private async runLeaveDocumentCleanupWorker() {
    try {
      const consumer = await this.createConsumer(LEAVE_DOCUMENT_CLEANUP_QUEUE);
      logger.info('🚀 Leave document cleanup worker started');

      while (true) {
        const result = await consumer.blpop(LEAVE_DOCUMENT_CLEANUP_QUEUE, 0);
        const rawJob = result?.[1];

        if (!rawJob) {
          continue;
        }

        await this.processLeaveDocumentCleanupJob(rawJob);
      }
    } catch (error: any) {
      this.workerStarted = false;
      logger.error(`Leave document cleanup worker stopped: ${error?.message || error}`);
    }
  }

  private async processLeaveDocumentCleanupJob(rawJob: string) {
    let payload: LeaveDocumentCleanupJob | null = null;

    try {
      payload = JSON.parse(rawJob) as LeaveDocumentCleanupJob;
      const documents = Array.isArray(payload.documents) ? payload.documents : [];

      if (!documents.length) {
        return;
      }

      await SupabaseStorageService.getInstance().removeDocuments(documents);
      logger.info(`Leave document cleanup completed for leave ${payload.leaveId}`);
    } catch (error: any) {
      const attempt = Number(payload?.attempt || 1);
      const message = error?.message || 'Unknown error';

      logger.error(
        `Leave document cleanup failed for leave ${payload?.leaveId ?? 'unknown'} on attempt ${attempt}: ${message}`,
      );

      const producer = await this.getProducer();

      if (attempt >= MAX_JOB_ATTEMPTS) {
        await producer.rpush(
          LEAVE_DOCUMENT_CLEANUP_DEAD_LETTER_QUEUE,
          JSON.stringify({
            ...payload,
            failedAt: Date.now(),
            error: message,
          }),
        );
        return;
      }

      await producer.rpush(
        LEAVE_DOCUMENT_CLEANUP_QUEUE,
        JSON.stringify({
          ...payload,
          attempt: attempt + 1,
        }),
      );
    }
  }

  private async runOAAttendanceExportWorker() {
    try {
      const consumer = await this.createConsumer(OA_ATTENDANCE_EXPORT_QUEUE);
      logger.info('🚀 OA attendance export worker started');

      while (true) {
        const result = await consumer.blpop(OA_ATTENDANCE_EXPORT_QUEUE, 0);
        const rawJob = result?.[1];

        if (!rawJob) {
          continue;
        }

        await this.processOAAttendanceExportJob(rawJob);
      }
    } catch (error: any) {
      this.workerStarted = false;
      logger.error(`OA attendance export worker stopped: ${error?.message || error}`);
    }
  }

  private async processOAAttendanceExportJob(rawJob: string) {
    let payload: OAAttendanceExportJob | null = null;

    try {
      payload = JSON.parse(rawJob) as OAAttendanceExportJob;

      const buffer = await OAAttendanceReportService.getInstance().buildWorkbookBuffer(
        payload.filters,
      );

      await MailService.getInstance().sendAttachmentMail({
        email: payload.email,
        subject: 'OA Attendance Report',
        html: `<p>Hi ${payload.userName},</p><p>Your OA attendance report is attached.</p>`,
        attachments: [
          {
            filename: `oa-attendance-report-${Date.now()}.xlsx`,
            content: Buffer.from(buffer),
            contentType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        ],
      });

      logger.info(`OA attendance export completed for ${payload.email}`);
    } catch (error: any) {
      const attempt = Number(payload?.attempt || 1);
      const message = error?.message || 'Unknown error';

      logger.error(
        `OA attendance export failed for ${payload?.email ?? 'unknown'} on attempt ${attempt}: ${message}`,
      );

      const producer = await this.getProducer();

      if (attempt >= MAX_JOB_ATTEMPTS) {
        await producer.rpush(
          OA_ATTENDANCE_EXPORT_DEAD_LETTER_QUEUE,
          JSON.stringify({
            ...payload,
            failedAt: Date.now(),
            error: message,
          }),
        );
        return;
      }

      await producer.rpush(
        OA_ATTENDANCE_EXPORT_QUEUE,
        JSON.stringify({
          ...payload,
          attempt: attempt + 1,
        }),
      );
    }
  }
}
