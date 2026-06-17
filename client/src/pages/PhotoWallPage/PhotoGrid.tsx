import React from 'react';
import { Image } from '@client/src/components/ui/image';
import { MapPin } from 'lucide-react';
import type { PhotoItem } from '@shared/api.interface';

interface PhotoGridProps {
  photos: PhotoItem[];
  onPhotoClick: (photo: PhotoItem) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="bg-background cursor-pointer group animate-in fade-in duration-300"
          onClick={() => onPhotoClick(photo)}
        >
          <div className="aspect-square overflow-hidden">
            <Image
              src={photo.url}
              alt={photo.location}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          {photo.location && (
            <div className="px-2 py-1.5 flex items-center gap-1">
              <MapPin className="size-2.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {photo.location}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
