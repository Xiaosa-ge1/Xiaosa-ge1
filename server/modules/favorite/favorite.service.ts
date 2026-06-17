import { Injectable, Inject } from '@nestjs/common';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import { favorite } from '@server/database/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import type { CreateFavoriteRequest, FavoriteItem } from '@shared/api.interface';

@Injectable()
export class FavoriteService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async findAll(type: string | undefined, page: number, pageSize: number) {
    const conditions = type ? [eq(favorite.type, type)] : [];
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countQuery = whereClause
      ? this.db.select({ count: sql<number>`count(*)::int` }).from(favorite).where(whereClause)
      : this.db.select({ count: sql<number>`count(*)::int` }).from(favorite);

    const countResult = await countQuery;
    const total: number = countResult[0]?.count ?? 0;

    const offset = (page - 1) * pageSize;
    const dataQuery = whereClause
      ? this.db.select().from(favorite).where(whereClause).orderBy(desc(favorite.createdAt)).limit(pageSize).offset(offset)
      : this.db.select().from(favorite).orderBy(desc(favorite.createdAt)).limit(pageSize).offset(offset);

    const rows = await dataQuery;
    const items: FavoriteItem[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      url: row.url,
      type: row.type,
      tags: row.tags as string[],
      createdAt: (row.createdAt as Date).toISOString(),
    }));

    return { items, total };
  }

  async create(data: CreateFavoriteRequest) {
    const tags = data.tags && data.tags.length > 0 ? data.tags : [];
    const result = await this.db
      .insert(favorite)
      .values({
        title: data.title,
        url: data.url,
        type: data.type || 'article',
        tags,
      })
      .returning({ id: favorite.id });

    return { id: result[0].id };
  }

  async remove(id: string) {
    await this.db.delete(favorite).where(eq(favorite.id, id));
    return { success: true };
  }
}
