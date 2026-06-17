import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type {
  FavoriteListResponse,
  CreateFavoriteRequest,
} from '@shared/api.interface';

export async function getFavorites(params: {
  type?: string;
  page: number;
  pageSize: number;
}): Promise<FavoriteListResponse> {
  try {
    const res = await axiosForBackend({
      url: '/api/favorites',
      method: 'GET',
      params,
    });
    return res.data;
  } catch (error) {
    logger.error('getFavorites failed', error);
    throw error;
  }
}

export async function createFavorite(
  data: CreateFavoriteRequest,
): Promise<{ id: string }> {
  try {
    const res = await axiosForBackend({
      url: '/api/favorites',
      method: 'POST',
      data,
    });
    return res.data;
  } catch (error) {
    logger.error('createFavorite failed', error);
    throw error;
  }
}

export async function deleteFavorite(
  id: string,
): Promise<{ success: boolean }> {
  try {
    const res = await axiosForBackend({
      url: `/api/favorites/${id}`,
      method: 'DELETE',
    });
    return res.data;
  } catch (error) {
    logger.error('deleteFavorite failed', error);
    throw error;
  }
}
