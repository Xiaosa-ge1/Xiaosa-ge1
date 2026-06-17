import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Plus } from 'lucide-react';
import { diaryApi } from '@/api';
import type { DiaryItem, DiaryDetail } from '@shared/api.interface';
import DiaryList from './DiaryList';
import DiaryDetailView from './DiaryDetail';
import DiaryForm from './DiaryForm';

const PAGE_SIZE = 10;

const DiaryPage: React.FC = () => {
  const [items, setItems] = useState<DiaryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<DiaryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchDiaries = async () => {
      setLoading(true);
      try {
        const result = await diaryApi.getDiaries(page + 1, PAGE_SIZE);
        if (!active) return;
        if (page === 0) {
          setItems(result.items);
        } else {
          setItems((prev: DiaryItem[]) => [...prev, ...result.items]);
        }
        setTotal(result.total);
      } catch (error) {
        logger.error('fetch diaries failed', error);
        toast.error('加载日记失败');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchDiaries();
    return () => {
      active = false;
    };
  }, [page]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setItems([]);
        setPage(0);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((prev: number) => prev + 1);
  }, []);

  const handleRefresh = useCallback(() => {
    setItems([]);
    setPage(0);
  }, []);

  const handleSelect = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const detail = await diaryApi.getDiaryDetail(id);
      setSelectedDiary(detail);
    } catch (error) {
      logger.error('fetch diary detail failed', error);
      toast.error('加载日记详情失败');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleBack = useCallback(() => {
    setSelectedDiary(null);
  }, []);

  const handleDeleted = useCallback(() => {
    setSelectedDiary(null);
    handleRefresh();
  }, [handleRefresh]);

  const handleUpdated = useCallback(async () => {
    if (!selectedDiary) return;
    try {
      const detail = await diaryApi.getDiaryDetail(selectedDiary.id);
      setSelectedDiary(detail);
      handleRefresh();
    } catch (error) {
      logger.error('refresh diary failed', error);
    }
  }, [selectedDiary, handleRefresh]);

  const hasMore = items.length < total;

  if (detailLoading) {
    return (
      <div className="max-w-lg mx-auto px-6 py-6">
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      </div>
    );
  }

  if (selectedDiary) {
    return (
      <div className="max-w-lg mx-auto px-6 py-6">
        <DiaryDetailView
          diary={selectedDiary}
          onBack={handleBack}
          onDeleted={handleDeleted}
          onUpdated={handleUpdated}
        />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-medium">日记</h1>
        <Button onClick={() => setCreateOpen(true)} className="rounded-sm">
          <Plus className="w-4 h-4 mr-1" />
          写日记
        </Button>
      </div>

      <DiaryList
        items={items}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onSelect={handleSelect}
      />

      <DiaryForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleRefresh}
      />
    </div>
  );
};

export default DiaryPage;
