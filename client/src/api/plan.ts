import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type {
  PlanListResponse,
  CreatePlanRequest,
  UpdatePlanRequest,
  BatchCreatePlansRequest,
  BatchCreatePlansResponse,
} from '@shared/api.interface';

export async function getPlans(date: string): Promise<PlanListResponse> {
  try {
    const res = await axiosForBackend({
      url: '/api/plans',
      method: 'GET',
      params: { date },
    });
    return res.data;
  } catch (error) {
    logger.error('getPlans failed', error);
    throw error;
  }
}

export async function createPlan(
  data: CreatePlanRequest,
): Promise<{ id: string }> {
  try {
    const res = await axiosForBackend({
      url: '/api/plans',
      method: 'POST',
      data,
    });
    return res.data;
  } catch (error) {
    logger.error('createPlan failed', error);
    throw error;
  }
}

export async function updatePlan(
  id: string,
  data: UpdatePlanRequest,
): Promise<{ success: boolean }> {
  try {
    const res = await axiosForBackend({
      url: `/api/plans/${id}`,
      method: 'PATCH',
      data,
    });
    return res.data;
  } catch (error) {
    logger.error('updatePlan failed', error);
    throw error;
  }
}

export async function deletePlan(
  id: string,
): Promise<{ success: boolean }> {
  try {
    const res = await axiosForBackend({
      url: `/api/plans/${id}`,
      method: 'DELETE',
    });
    return res.data;
  } catch (error) {
    logger.error('deletePlan failed', error);
    throw error;
  }
}

export async function batchCreatePlans(
  data: BatchCreatePlansRequest,
): Promise<BatchCreatePlansResponse> {
  try {
    const res = await axiosForBackend({
      url: '/api/plans/batch',
      method: 'POST',
      data,
    });
    return res.data;
  } catch (error) {
    logger.error('batchCreatePlans failed', error);
    throw error;
  }
}
