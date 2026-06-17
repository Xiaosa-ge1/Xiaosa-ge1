import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@client/src/components/ui/dialog';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Calendar } from '@client/src/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@client/src/components/ui/popover';
import { Upload, MapPin, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { getDataloom } from '@lark-apaas/client-toolkit/dataloom';
import { getDefaultBucketId } from '@lark-apaas/client-toolkit/tools/storage';
import { photoApi } from '@client/src/api';
import dayjs from 'dayjs';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const UploadDialog: React.FC<UploadDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [location, setLocation] = useState<string>('');
  const [shotDate, setShotDate] = useState<Date | undefined>(new Date());
  const [uploading, setUploading] = useState<boolean>(false);

  const resetForm = () => {
    setFile(null);
    setLocation('');
    setShotDate(new Date());
    setUploading(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('请选择照片');
      return;
    }
    if (!location.trim()) {
      toast.error('请填写地点');
      return;
    }
    if (!shotDate) {
      toast.error('请选择拍摄时间');
      return;
    }

    try {
      setUploading(true);

      const dataloom = await getDataloom();
      const { data, error } = await dataloom.storage
        .from(getDefaultBucketId())
        .uploadFile(file);

      if (error || !data) {
        throw new Error(error?.message || '文件上传失败');
      }

      await photoApi.createPhoto({
        url: data.download_url,
        location: location.trim(),
        shotTime: shotDate.toISOString(),
      });

      toast.success('照片上传成功');
      resetForm();
      onSuccess();
    } catch (error) {
      logger.error('Upload photo failed', error);
      toast.error('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">上传照片</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">照片</label>
            <label className="flex items-center justify-center h-32 border border-border border-dashed rounded-sm cursor-pointer hover:bg-accent/50 transition-colors">
              {file ? (
                <span className="text-sm text-foreground">{file.name}</span>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                  <Upload className="size-5" />
                  <span className="text-xs">点击选择照片</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              地点
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="输入拍摄地点"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground flex items-center gap-1.5">
              <CalendarIcon className="size-3.5" />
              拍摄时间
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {shotDate ? (
                    dayjs(shotDate).format('YYYY-MM-DD')
                  ) : (
                    <span className="text-muted-foreground">选择日期</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={shotDate}
                  onSelect={setShotDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={uploading}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={uploading}
            >
              {uploading ? '上传中...' : '上传'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
