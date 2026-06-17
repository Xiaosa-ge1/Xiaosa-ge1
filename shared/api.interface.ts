/* 前后端共享的类型写在这里 */

export interface PlanItem {
  id: string;
  title: string;
  scheduledTime: string | null;
  completed: boolean;
  date: string;
}

export interface PlanListResponse {
  items: PlanItem[];
  total: number;
}

export interface CreatePlanRequest {
  title: string;
  scheduledTime?: string;
  date: string;
}

export interface UpdatePlanRequest {
  completed?: boolean;
  title?: string;
  scheduledTime?: string;
}

export interface BatchCreatePlansRequest {
  plans: CreatePlanRequest[];
}

export interface BatchCreatePlansResponse {
  success: boolean;
  ids: string[];
}

export interface DiaryItem {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
}

export interface DiaryDetail {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface DiaryListResponse {
  items: DiaryItem[];
  total: number;
}

export interface CreateDiaryRequest {
  title: string;
  content: string;
}

export interface UpdateDiaryRequest {
  title?: string;
  content?: string;
}

export interface HabitItem {
  id: string;
  name: string;
  streak: number;
  todayChecked: boolean;
}

export interface HabitListResponse {
  items: HabitItem[];
}

export interface CreateHabitRequest {
  name: string;
}

export interface CheckinResponse {
  success: boolean;
  newStreak: number;
}

export interface PhotoItem {
  id: string;
  url: string;
  location: string;
  shotTime: string;
}

export interface PhotoDetail {
  id: string;
  url: string;
  location: string;
  shotTime: string;
  createdAt: string;
}

export interface PhotoListResponse {
  items: PhotoItem[];
  total: number;
}

export interface CreatePhotoRequest {
  url: string;
  location: string;
  shotTime: string;
}

export interface FavoriteItem {
  id: string;
  title: string;
  url: string;
  type: string;
  tags: string[];
  createdAt: string;
}

export interface FavoriteListResponse {
  items: FavoriteItem[];
  total: number;
}

export interface CreateFavoriteRequest {
  title: string;
  url: string;
  type: string;
  tags?: string[];
}

export interface TodayPlansResponse {
  total: number;
  completed: number;
  pendingItems: Array<{
    id: string;
    title: string;
  }>;
}

export interface TodayCheckinResponse {
  habits: Array<{
    id: string;
    name: string;
    checked: boolean;
  }>;
}

export interface RecentDiariesResponse {
  items: Array<{
    id: string;
    title: string;
    summary: string;
    createdAt: string;
  }>;
}
