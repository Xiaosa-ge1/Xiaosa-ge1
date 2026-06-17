import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { habit } from '@server/database/schema';
import { eq, sql } from 'drizzle-orm';
import type { HabitItem, HabitListResponse, CreateHabitRequest, CheckinResponse } from '@shared/api.interface';

@Injectable()
export class HabitService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async findAll(): Promise<HabitListResponse> {
    const result = await this.db.select().from(habit);
    
    const items: HabitItem[] = result.map((h) => {
      const today = new Date().toISOString().split('T')[0];
      const todayChecked = h.lastCheckinDate === today;
      return {
        id: h.id,
        name: h.name,
        streak: h.streak,
        todayChecked,
      };
    });
    
    return { items };
  }

  async create(dto: CreateHabitRequest): Promise<{ id: string }> {
    const result = await this.db
      .insert(habit)
      .values({
        name: dto.name,
        streak: 0,
        lastCheckinDate: null,
      })
      .returning({ id: habit.id });
    
    return { id: result[0].id };
  }

  async checkin(id: string): Promise<CheckinResponse> {
    const result = await this.db.select().from(habit).where(eq(habit.id, id));
    
    if (result.length === 0) {
      throw new Error('Habit not found');
    }
    
    const habitRecord = result[0];
    const today = new Date().toISOString().split('T')[0];
    
    if (habitRecord.lastCheckinDate === today) {
      return { success: true, newStreak: habitRecord.streak };
    }
    
    let newStreak: number;
    
    if (!habitRecord.lastCheckinDate) {
      newStreak = 1;
    } else {
      const lastDate = new Date(habitRecord.lastCheckinDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (habitRecord.lastCheckinDate === yesterdayStr) {
        newStreak = habitRecord.streak + 1;
      } else {
        newStreak = 1;
      }
    }
    
    await this.db
      .update(habit)
      .set({
        lastCheckinDate: today,
        streak: newStreak,
      })
      .where(eq(habit.id, id));
    
    return { success: true, newStreak };
  }

  async remove(id: string): Promise<{ success: boolean }> {
    await this.db.delete(habit).where(eq(habit.id, id));
    return { success: true };
  }
}
