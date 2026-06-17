import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type {
  PhotoListResponse,
  PhotoDetail,
  CreatePhotoRequest,
} from '@shared/api.interface';

export async function getPhotos(
  page: number,
  pageSize: number,
): Promise<PhotoListResponse> {
  try {
    const res = await axiosForBackend({
      url: '/api/photos',
      method: 'GET',
      params: { page, pageSize },
    });
    return res.data;
  } catch (error) {
    logger.error('getPhotos failed', error);
    throw error;
  }
}

export async function getPhotoDetail(id: string): Promise<PhotoDetail> {
  try {
    const res = await axiosForBackend({
      url: `/api/photos/${id}`,
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    logger.error('getPhotoDetail failed', error);
    throw error;
  }
}

export async function createPhoto(
  data: CreatePhotoRequest,
): Promise<{ id: string }> {
  try {
    const res = await axiosForBackend({
      url: '/api/photos',
      method: 'POST',
      data,
    });
    return res.data;
  } catch (error) {
    logger.error('createPhoto failed', error);
    throw error;
  }
}

export async function deletePhoto(
  id: string,
): Promise<{ success: boolean }> {
  try {
    const res = await axiosForBackend({
      url: `/api/photos/${id}`,
      method: 'DELETE',
    });
    return res.data;
  } catch (error) {
    logger.error('deletePhoto failed', error);
    throw error;
  }
}
