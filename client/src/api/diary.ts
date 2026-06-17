import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type {
  DiaryListResponse,
  DiaryDetail,
  CreateDiaryRequest,
  UpdateDiaryRequest,
} from '@shared/api.interface';

export async function getDiaries(
  page: number,
  pageSize: number,
): Promise<DiaryListResponse> {
  try {
    const res = await axiosForBackend({
      url: '/api/diary',
      method: 'GET',
      params: { page, pageSize },
    });
    return res.data;
  } catch (error) {
    logger.error('getDiaries failed', error);
    throw error;
  }
}

export async function getDiaryDetail(id: string): Promise<DiaryDetail> {
  try {
    const res = await axiosForBackend({
      url: `/api/diary/${id}`,
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    logger.error('getDiaryDetail failed', error);
    throw error;
  }
}

export async function createDiary(
  data: CreateDiaryRequest,
): Promise<{ id: string }> {
  try {
    const res = await axiosForBackend({
      url: '/api/diary',
      method: 'POST',
      data,
    });
    return res.data;
  } catch (error) {
    logger.error('createDiary failed', error);
    throw error;
  }
}

export async function updateDiary(
  id: string,
  data: UpdateDiaryRequest,
): Promise<{ success: boolean }> {
  try {
    const res = await axiosForBackend({
      url: `/api/diary/${id}`,
      method: 'PATCH',
      data,
    });
    return res.data;
  } catch (error) {
    logger.error('updateDiary failed', error);
    throw error;
  }
}

export async function deleteDiary(
  id: string,
): Promise<{ success: boolean }> {
  try {
    const res = await axiosForBackend({
      url: `/api/diary/${id}`,
      method: 'DELETE',
    });
    return res.data;
  } catch (error) {
    logger.error('deleteDiary failed', error);
    throw error;
  }
}
