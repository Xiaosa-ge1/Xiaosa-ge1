import React from 'react';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { PenLine } from 'lucide-react';
import dayjs from 'dayjs';
import type { DiaryItem } from '@shared/api.interface';

interface DiaryListProps {
  items: DiaryItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelect: (id: string) => void;
}

const DiaryList: React.FC<DiaryListProps> = ({
  items,
  loading,
  hasMore,
  onLoadMore,
  onSelect,
}) => {
  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <PenLine className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="font-serif text-lg text-muted-foreground">
          你的成长记录从这里开始
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          点击右上角「写日记」记录今天的感悟
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-6">
        {items.map((item: DiaryItem) => (
          <div key={item.id} className="relative">
            <div className="absolute -left-5 top-6 w-2 h-2 rounded-full bg-foreground" />
            <Card
              className="border border-border rounded-sm bg-muted/30 p-6 shadow-none cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onSelect(item.id)}
            >
              <p className="text-xs text-muted-foreground mb-2">
                {dayjs(item.createdAt).format('M月D日')}
              </p>
              <h3 className="font-serif text-base font-medium mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.summary}
              </p>
            </Card>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      )}

      {!loading && hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={onLoadMore}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            加载更多
          </button>
        </div>
      )}
    </div>
  );
};

export default DiaryList;
