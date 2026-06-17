import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { diary } from '@server/database/schema';
import { eq, desc, sql, count } from 'drizzle-orm';
import type {
  DiaryListResponse,
  DiaryDetail,
  CreateDiaryRequest,
  UpdateDiaryRequest,
} from '@shared/api.interface';

@Injectable()
export class DiaryService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async findAll(page: number, pageSize: number): Promise<DiaryListResponse> {
    const offset = (page - 1) * pageSize;

    const rows = await this.db
      .select({
        id: diary.id,
        title: diary.title,
        content: diary.content,
        createdAt: diary.createdAt,
      })
      .from(diary)
      .orderBy(desc(diary.createdAt))
      .limit(pageSize)
      .offset(offset);

    const countResult = await this.db
      .select({ count: count() })
      .from(diary);

    const total = Number(countResult[0]?.count ?? 0);

    const items = rows.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.content.replace(/<[^>]*>/g, '').substring(0, 80),
      createdAt: row.createdAt.toISOString(),
    }));

    return { items, total };
  }

  async findById(id: string): Promise<DiaryDetail> {
    const rows = await this.db
      .select({
        id: diary.id,
        title: diary.title,
        content: diary.content,
        createdAt: diary.createdAt,
      })
      .from(diary)
      .where(eq(diary.id, id));

    if (rows.length === 0) {
      throw new Error('Diary not found');
    }

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async create(dto: CreateDiaryRequest): Promise<{ id: string }> {
    const rows = await this.db
      .insert(diary)
      .values({
        title: dto.title,
        content: dto.content,
      })
      .returning({ id: diary.id });

    return { id: rows[0].id };
  }

  async update(id: string, dto: UpdateDiaryRequest): Promise<{ success: boolean }> {
    const updateData: Record<string, unknown> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;

    if (Object.keys(updateData).length > 0) {
      await this.db.update(diary).set(updateData).where(eq(diary.id, id));
    }

    return { success: true };
  }

  async remove(id: string): Promise<{ success: boolean }> {
    await this.db.delete(diary).where(eq(diary.id, id));
    return { success: true };
  }
}
