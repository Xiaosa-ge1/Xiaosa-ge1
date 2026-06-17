import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { photo } from '@server/database/schema';
import { eq, desc, sql } from 'drizzle-orm';
import type {
  PhotoItem,
  PhotoDetail,
  PhotoListResponse,
  CreatePhotoRequest,
} from '@shared/api.interface';

@Injectable()
export class PhotoService {
  private readonly logger = new Logger(PhotoService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getPhotos(page: number, pageSize: number): Promise<PhotoListResponse> {
    const offset = (page - 1) * pageSize;

    const [items, countResult] = await Promise.all([
      this.db
        .select({
          id: photo.id,
          url: photo.url,
          location: photo.location,
          shotTime: photo.shotTime,
        })
        .from(photo)
        .orderBy(desc(photo.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(photo),
    ]);

    const photoItems: PhotoItem[] = items.map((item) => ({
      id: item.id,
      url: item.url,
      location: item.location,
      shotTime: item.shotTime.toISOString(),
    }));

    return {
      items: photoItems,
      total: countResult[0]?.count ?? 0,
    };
  }

  async getPhotoDetail(id: string): Promise<PhotoDetail> {
    const result = await this.db
      .select({
        id: photo.id,
        url: photo.url,
        location: photo.location,
        shotTime: photo.shotTime,
        createdAt: photo.createdAt,
      })
      .from(photo)
      .where(eq(photo.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException(`Photo ${id} not found`);
    }

    const row = result[0];
    return {
      id: row.id,
      url: row.url,
      location: row.location,
      shotTime: row.shotTime.toISOString(),
      createdAt: row.createdAt.toISOString(),
    };
  }

  async createPhoto(dto: CreatePhotoRequest): Promise<{ id: string }> {
    const result = await this.db
      .insert(photo)
      .values({
        url: dto.url,
        location: dto.location,
        shotTime: new Date(dto.shotTime),
      })
      .returning({ id: photo.id });

    this.logger.log(`Photo created: ${result[0].id}`);
    return { id: result[0].id };
  }

  async deletePhoto(id: string): Promise<{ success: boolean }> {
    const result = await this.db
      .delete(photo)
      .where(eq(photo.id, id))
      .returning({ id: photo.id });

    if (result.length === 0) {
      throw new NotFoundException(`Photo ${id} not found`);
    }

    this.logger.log(`Photo deleted: ${id}`);
    return { success: true };
  }
}
