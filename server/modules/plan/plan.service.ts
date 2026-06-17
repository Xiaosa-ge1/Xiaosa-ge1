import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { plan } from '@server/database/schema';
import { eq, asc } from 'drizzle-orm';
import type { CreatePlanRequest, UpdatePlanRequest } from '@shared/api.interface';

@Injectable()
export class PlanService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async findByDate(date: string) {
    const items = await this.db
      .select({
        id: plan.id,
        title: plan.title,
        scheduledTime: plan.scheduledTime,
        completed: plan.completed,
        date: plan.date,
      })
      .from(plan)
      .where(eq(plan.date, date))
      .orderBy(asc(plan.scheduledTime));

    return { items, total: items.length };
  }

  async create(dto: CreatePlanRequest, userId: string) {
    const result = await this.db
      .insert(plan)
      .values({
        title: dto.title,
        scheduledTime: dto.scheduledTime ?? null,
        date: dto.date,
      })
      .returning({ id: plan.id });

    return { id: result[0].id };
  }

  async update(id: string, dto: UpdatePlanRequest) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (dto.completed !== undefined) updateData.completed = dto.completed;
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.scheduledTime !== undefined) updateData.scheduledTime = dto.scheduledTime;

    await this.db.update(plan).set(updateData).where(eq(plan.id, id));

    return { success: true };
  }

  async remove(id: string) {
    await this.db.delete(plan).where(eq(plan.id, id));
    return { success: true };
  }

  async batchCreate(plans: CreatePlanRequest[], userId: string) {
    const result = await this.db
      .insert(plan)
      .values(
        plans.map((p) => ({
          title: p.title,
          scheduledTime: p.scheduledTime ?? null,
          date: p.date,
        })),
      )
      .returning({ id: plan.id });

    return { success: true, ids: result.map((p) => p.id) };
  }
}
