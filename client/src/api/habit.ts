import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type {
  HabitListResponse,
  CreateHabitRequest,
  CheckinResponse,
} from '@shared/api.interface';

export async function getHabits(): Promise<HabitListResponse> {
  try {
    const res = await axiosForBackend({
      url: '/api/habits',
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    logger.error('getHabits failed', error);
    throw error;
  }
}

export async function createHabit(
  data: CreateHabitRequest,
): Promise<{ id: string }> {
  try {
    const res = await axiosForBackend({
      url: '/api/habits',
      method: 'POST',
      data,
    });
    return res.data;
  } catch (error) {
    logger.error('createHabit failed', error);
    throw error;
  }
}

export async function checkin(id: string): Promise<CheckinResponse> {
  try {
    const res = await axiosForBackend({
      url: `/api/habits/${id}/checkin`,
      method: 'PATCH',
    });
    return res.data;
  } catch (error) {
    logger.error('checkin failed', error);
    throw error;
  }
}

export async function deleteHabit(
  id: string,
): Promise<{ success: boolean }> {
  try {
    const res = await axiosForBackend({
      url: `/api/habits/${id}`,
      method: 'DELETE',
    });
    return res.data;
  } catch (error) {
    logger.error('deleteHabit failed', error);
    throw error;
  }
}
