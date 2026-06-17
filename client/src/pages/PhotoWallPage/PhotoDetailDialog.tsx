import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from '@client/src/components/ui/dialog';
import { Button } from '@client/src/components/ui/button';
import { Image } from '@client/src/components/ui/image';
import { MapPin, Clock, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import type { PhotoDetail } from '@shared/api.interface';

interface PhotoDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photo: PhotoDetail | null;
  onDelete: (id: string) => void;
  loading: boolean;
}

export const PhotoDetailDialog: React.FC<PhotoDetailDialogProps> = ({
  open,
  onOpenChange,
  photo,
  onDelete,
  loading,
}) => {
  if (!photo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/90" />
      <DialogContent className="border-0 bg-transparent p-0 max-w-[90vw] max-h-[90vh] w-auto shadow-none [&>button]:hidden">
        <div className="flex flex-col items-center gap-4">
          <div className="max-h-[70vh] overflow-hidden">
            <Image
              src={photo.url}
              alt={photo.location}
              className="max-h-[70vh] w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-4 text-white/80 text-sm">
            {photo.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                <span>{photo.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>{dayjs(photo.shotTime).format('YYYY-MM-DD HH:mm')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10 gap-1.5"
              onClick={() => onDelete(photo.id)}
            >
              <Trash2 className="size-3.5" />
              删除
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => onOpenChange(false)}
            >
              关闭
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
