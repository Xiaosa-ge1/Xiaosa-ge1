import React, { useState, useCallback, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Plus, Trash2, ExternalLink, Bookmark } from 'lucide-react';
import dayjs from 'dayjs';
import { favoriteApi } from '@client/src/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { FavoriteItem } from '@shared/api.interface';
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';

const FILTER_TABS: Array<{ key: string; label: string }> = [
  { key: '', label: '全部' },
  { key: 'article', label: '文章' },
  { key: 'video', label: '视频' },
];

const TYPE_LABELS: Record<string, string> = {
  article: '文章',
  video: '视频',
};

const addFavoriteSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  url: z
    .string()
    .min(1, 'URL 不能为空')
    .regex(/^https?:\/\/.+/, 'URL 必须以 http:// 或 https:// 开头'),
  type: z.string().min(1, '请选择类型'),
  tagsInput: z.string().optional(),
});

type AddFavoriteFormData = z.infer<typeof addFavoriteSchema>;

const FavoritesPage: React.FC = () => {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [total, setTotal] = useState(0);
  const [activeType, setActiveType] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FavoriteItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AddFavoriteFormData>({
    resolver: zodResolver(addFavoriteSchema),
    defaultValues: {
      title: '',
      url: '',
      type: 'article',
      tagsInput: '',
    },
  });

  const fetchFavorites = useCallback(async (type: string) => {
    setLoading(true);
    try {
      const result = await favoriteApi.getFavorites({
        type: type || undefined,
        page: 1,
        pageSize: 50,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (error) {
      logger.error('fetch favorites failed', error);
      toast.error('加载收藏列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites(activeType);
  }, [activeType, fetchFavorites]);

  const handleAddSubmit = async (data: AddFavoriteFormData) => {
    setSubmitting(true);
    try {
      const rawTags = data.tagsInput || '';
      const tags = rawTags
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);
      await favoriteApi.createFavorite({
        title: data.title,
        url: data.url,
        type: data.type,
        tags,
      });
      toast.success('收藏成功');
      setDialogOpen(false);
      form.reset();
      fetchFavorites(activeType);
    } catch (error) {
      logger.error('create favorite failed', error);
      toast.error('收藏失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await favoriteApi.deleteFavorite(deleteTarget.id);
      toast.success('已删除');
      setDeleteTarget(null);
      fetchFavorites(activeType);
    } catch (error) {
      logger.error('delete favorite failed', error);
      toast.error('删除失败，请重试');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bookmark className="size-5" />
          <h1 className="text-lg font-semibold">收藏</h1>
          <span className="text-sm text-muted-foreground">{total}</span>
        </div>
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-1"
        >
          <Plus className="size-4" />
          添加收藏
        </Button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-border pb-3">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveType(tab.key)}
            className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
              activeType === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          加载中...
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <Bookmark className="size-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            收藏有价值的文章和视频
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="border border-border rounded-sm shadow-none p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <UniversalLink
                    to={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline flex items-center gap-1.5 break-words"
                  >
                    {item.title}
                    <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                  </UniversalLink>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs rounded-sm">
                      {TYPE_LABELS[item.type] || item.type}
                    </Badge>
                    {item.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs border border-border rounded-sm px-1.5 py-0.5 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {dayjs(item.createdAt).format('YYYY-MM-DD')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 size-8 p-0"
                  onClick={() => setDeleteTarget(item)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) form.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加收藏</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标题</FormLabel>
                    <FormControl>
                      <Input placeholder="输入标题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/article"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>类型</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="article">文章</SelectItem>
                        <SelectItem value="video">视频</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tagsInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标签</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="用逗号分隔，如：React, TypeScript"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    form.reset();
                  }}
                >
                  取消
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? '添加中...' : '添加'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除「{deleteTarget?.title}」吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FavoritesPage;
