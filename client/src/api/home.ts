import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type {
  TodayPlansResponse,
  TodayCheckinResponse,
  RecentDiariesResponse,
} from '@shared/api.interface';

export async function getTodayPlans(): Promise<TodayPlansResponse> {
  try {
    const res = await axiosForBackend({
      url: '/api/home/today-plans',
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    logger.error('getTodayPlans failed', error);
    throw error;
  }
}

export async function getTodayCheckin(): Promise<TodayCheckinResponse> {
  try {
    const res = await axiosForBackend({
      url: '/api/home/today-checkin',
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    logger.error('getTodayCheckin failed', error);
    throw error;
  }
}

export async function getRecentDiaries(): Promise<RecentDiariesResponse> {
  try {
    const res = await axiosForBackend({
      url: '/api/home/recent-diaries',
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    logger.error('getRecentDiaries failed', error);
    throw error;
  }
}
