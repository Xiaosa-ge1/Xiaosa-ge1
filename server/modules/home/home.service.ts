import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { eq, desc, sql } from 'drizzle-orm';
import { plan, habit, diary } from '@server/database/schema';
import type {
  TodayPlansResponse,
  TodayCheckinResponse,
  RecentDiariesResponse,
} from '@shared/api.interface';

@Injectable()
export class HomeService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getTodayPlans(): Promise<TodayPlansResponse> {
    const rows = await this.db
      .select({
        id: plan.id,
        title: plan.title,
        completed: plan.completed,
      })
      .from(plan)
      .where(eq(plan.date, sql`CURRENT_DATE`));

    const total = rows.length;
    const completed = rows.filter((r) => r.completed).length;
    const pendingItems = rows
      .filter((r) => !r.completed)
      .map((r) => ({ id: r.id, title: r.title }));

    return { total, completed, pendingItems };
  }

  async getTodayCheckin(): Promise<TodayCheckinResponse> {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const rows = await this.db
      .select({
        id: habit.id,
        name: habit.name,
        lastCheckinDate: habit.lastCheckinDate,
      })
      .from(habit);

    const habits = rows.map((r) => ({
      id: r.id,
      name: r.name,
      checked: r.lastCheckinDate === todayStr,
    }));

    return { habits };
  }

  async getRecentDiaries(): Promise<RecentDiariesResponse> {
    const rows = await this.db
      .select({
        id: diary.id,
        title: diary.title,
        content: diary.content,
        createdAt: diary.createdAt,
      })
      .from(diary)
      .orderBy(desc(diary.createdAt))
      .limit(3);

    const items = rows.map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.content.length > 50 ? r.content.slice(0, 50) + '...' : r.content,
      createdAt: r.createdAt.toISOString(),
    }));

    return { items };
  }
}
