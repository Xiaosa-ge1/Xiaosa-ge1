import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  ListTodo,
  Circle,
  CircleCheckBig,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { homeApi } from '@client/src/api';
import * as habitApi from '@client/src/api/habit';
import type {
  TodayPlansResponse,
  TodayCheckinResponse,
  RecentDiariesResponse,
} from '@shared/api.interface';

dayjs.locale('zh-cn');

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function getGreeting(): string {
  const now = dayjs();
  const month = now.month() + 1;
  const day = now.date();
  const weekday = WEEKDAYS[now.day()];
  const suffix = now.day() === 1 ? '，新的一周加油' : '';
  return `${month}月${day}日 ${weekday}${suffix}`;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<TodayPlansResponse | null>(null);
  const [checkin, setCheckin] = useState<TodayCheckinResponse | null>(null);
  const [diaries, setDiaries] = useState<RecentDiariesResponse | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  async function fetchData(): Promise<void> {
    try {
      const [plansData, checkinData, diariesData] = await Promise.all([
        homeApi.getTodayPlans(),
        homeApi.getTodayCheckin(),
        homeApi.getRecentDiaries(),
      ]);
      setPlans(plansData);
      setCheckin(checkinData);
      setDiaries(diariesData);
    } catch (error) {
      logger.error('Failed to fetch home data', error);
      toast.error('加载首页数据失败');
    }
  }

  async function handleQuickCheckin(id: string): Promise<void> {
    setCheckingIn(id);
    try {
      await habitApi.checkin(id);
      toast.success('打卡成功');
      const checkinData = await homeApi.getTodayCheckin();
      setCheckin(checkinData);
    } catch (error) {
      logger.error('Quick checkin failed', error);
      toast.error('打卡失败');
    } finally {
      setCheckingIn(null);
    }
  }

  const greeting = getGreeting();
  const allPlansDone = plans !== null && plans.total > 0 && plans.completed === plans.total;
  const plansPercent = plans && plans.total > 0
    ? Math.round((plans.completed / plans.total) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="px-2">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          {greeting}
        </h1>
      </div>

      <Card
        className="rounded-sm border border-border shadow-none cursor-pointer"
        onClick={() => navigate('/plans')}
      >
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <ListTodo className="size-5 text-foreground" />
            <CardTitle className="font-serif text-lg">今日计划</CardTitle>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {plans === null ? (
            <div className="h-16 animate-pulse rounded-sm bg-accent" />
          ) : plans.total === 0 ? (
            <p className="text-sm text-muted-foreground italic">今天还没有计划</p>
          ) : allPlansDone ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">
                今天全部搞定了！
              </p>
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                100%
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground tabular-nums">
                {plans.completed}/{plans.total} 已完成 · {plansPercent}%
              </p>
              <ul className="flex flex-col gap-2">
                {plans.pendingItems.slice(0, 3).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <Circle className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{item.title}</span>
                  </li>
                ))}
              </ul>
              {plans.pendingItems.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  还有 {plans.pendingItems.length - 3} 项待完成
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card
        className="rounded-sm border border-border shadow-none cursor-pointer"
        onClick={() => navigate('/checkin')}
      >
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <CircleCheckBig className="size-5 text-foreground" />
            <CardTitle className="font-serif text-lg">今日打卡</CardTitle>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {checkin === null ? (
            <div className="h-16 animate-pulse rounded-sm bg-accent" />
          ) : checkin.habits.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">还没有习惯可以打卡</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {checkin.habits.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center justify-between"
                >
                  <span
                    className={`text-sm ${
                      h.checked
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {h.name}
                  </span>
                  <button
                    type="button"
                    disabled={h.checked || checkingIn === h.id}
                    className="flex size-6 items-center justify-center"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      if (!h.checked) handleQuickCheckin(h.id);
                    }}
                  >
                    {h.checked ? (
                      <CircleCheckBig className="size-5 text-foreground" />
                    ) : (
                      <Circle className="size-5 text-muted-foreground" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card
        className="rounded-sm border border-border shadow-none cursor-pointer"
        onClick={() => navigate('/diary')}
      >
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="size-5 text-foreground" />
            <CardTitle className="font-serif text-lg">最近日记</CardTitle>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {diaries === null ? (
            <div className="h-16 animate-pulse rounded-sm bg-accent" />
          ) : diaries.items.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">还没有写过日记</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {diaries.items.map((item) => (
                <li key={item.id} className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.summary}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {dayjs(item.createdAt).format('M月D日')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
