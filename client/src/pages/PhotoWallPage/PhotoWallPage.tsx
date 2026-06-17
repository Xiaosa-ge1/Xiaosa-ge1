import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@client/src/components/ui/button';
import { Upload } from 'lucide-react';
import { photoApi } from '@client/src/api';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { PhotoItem, PhotoDetail as PhotoDetailType } from '@shared/api.interface';
import { PhotoGrid } from './PhotoGrid';
import { PhotoDetailDialog } from './PhotoDetailDialog';
import { UploadDialog } from './UploadDialog';

const PhotoWallPage: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadOpen, setUploadOpen] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoDetailType | null>(null);
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await photoApi.getPhotos(1, 50);
      setPhotos(data.items);
      setTotal(data.total);
    } catch (error) {
      logger.error('Failed to fetch photos', error);
      toast.error('加载照片失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handlePhotoClick = async (photoItem: PhotoItem) => {
    try {
      setDetailLoading(true);
      const detail = await photoApi.getPhotoDetail(photoItem.id);
      setSelectedPhoto(detail);
      setDetailOpen(true);
    } catch (error) {
      logger.error('Failed to fetch photo detail', error);
      toast.error('加载照片详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await photoApi.deletePhoto(id);
      toast.success('照片已删除');
      setDetailOpen(false);
      setSelectedPhoto(null);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
    } catch (error) {
      logger.error('Failed to delete photo', error);
      toast.error('删除照片失败');
    }
  };

  const handleUploadSuccess = () => {
    setUploadOpen(false);
    fetchPhotos();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-foreground">照片墙</h1>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUploadOpen(true)}
            className="gap-1.5"
          >
            <Upload className="size-3.5" />
            上传照片
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-sm text-muted-foreground">加载中...</div>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Upload className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground italic">
              用照片记录你的成长瞬间
            </p>
          </div>
        ) : (
          <PhotoGrid photos={photos} onPhotoClick={handlePhotoClick} />
        )}
      </div>

      <PhotoDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        photo={selectedPhoto}
        onDelete={handleDelete}
        loading={detailLoading}
      />

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default PhotoWallPage;
