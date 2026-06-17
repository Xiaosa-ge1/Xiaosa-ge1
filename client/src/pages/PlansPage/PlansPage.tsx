import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { planApi } from '@client/src/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { PlanItem } from '@shared/api.interface';

dayjs.locale('zh-cn');

const planFormSchema = z.object({
  title: z.string().min(1, '请输入计划内容'),
  scheduledTime: z.string(),
});

type PlanFormData = z.infer<typeof planFormSchema>;

const PlansPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);

  const fetchPlans = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res = await planApi.getPlans(date);
      setPlans(res.items);
    } catch (error) {
      logger.error('Failed to fetch plans', error);
      toast.error('获取计划失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans(currentDate);
  }, [currentDate, fetchPlans]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPlans(currentDate);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [currentDate, fetchPlans]);

  const handleDateChange = (delta: number) => {
    setCurrentDate((prev) => dayjs(prev).add(delta, 'day').format('YYYY-MM-DD'));
  };

  const handleToggleComplete = async (item: PlanItem) => {
    const newCompleted = !item.completed;
    setPlans((prev) =>
      prev.map((p) =>
        p.id === item.id ? { ...p, completed: newCompleted } : p,
      ),
    );
    try {
      await planApi.updatePlan(item.id, { completed: newCompleted });
    } catch (error) {
      logger.error('Failed to toggle plan', error);
      toast.error('更新计划失败');
      fetchPlans(currentDate);
    }
  };

  const handleDelete = async (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    try {
      await planApi.deletePlan(id);
      toast.success('已删除');
    } catch (error) {
      logger.error('Failed to delete plan', error);
      toast.error('删除计划失败');
      fetchPlans(currentDate);
    }
  };

  const handleAdd = () => {
    setEditingPlan(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: PlanItem) => {
    setEditingPlan(item);
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setEditingPlan(null);
    fetchPlans(currentDate);
  };

  const isToday = currentDate === dayjs().format('YYYY-MM-DD');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDateChange(-1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="text-center">
          <div className="text-lg font-semibold">
            {dayjs(currentDate).format('YYYY年M月D日 ddd')}
          </div>
          {isToday && (
            <div className="text-xs text-muted-foreground">今天</div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDateChange(1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          加载中...
        </div>
      ) : plans.length > 0 ? (
        <div className="border-t border-border">
          {plans.map((item) => (
            <PlanListItem
              key={item.id}
              item={item}
              onToggle={handleToggleComplete}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-sm text-muted-foreground">
          暂无计划
        </div>
      )}

      <Button
        onClick={handleAdd}
        className="w-full bg-primary text-primary-foreground"
      >
        <Plus className="size-4 mr-2" />
        添加计划
      </Button>

      <PlanFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingPlan(null);
        }}
        editingPlan={editingPlan}
        currentDate={currentDate}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

interface PlanListItemProps {
  item: PlanItem;
  onToggle: (item: PlanItem) => void;
  onDelete: (id: string) => void;
  onEdit: (item: PlanItem) => void;
}

const PlanListItem: React.FC<PlanListItemProps> = ({
  item,
  onToggle,
  onDelete,
  onEdit,
}) => {
  return (
    <div className="flex items-center gap-3 py-4 border-b border-border last:border-b-0">
      <Checkbox
        checked={item.completed}
        onCheckedChange={() => onToggle(item)}
        className="size-5 rounded-sm"
      />
      {item.scheduledTime && (
        <span className="text-xs text-muted-foreground w-12 shrink-0 tabular-nums">
          {item.scheduledTime}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="sync" initial={false}>
          {item.completed ? (
            <motion.span
              key="completed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="block text-muted-foreground line-through truncate"
            >
              {item.title}
            </motion.span>
          ) : (
            <motion.span
              key="incomplete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="block truncate cursor-pointer"
              onClick={() => onEdit(item)}
            >
              {item.title}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={() => onDelete(item.id)}
      >
        <Trash2 className="size-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
};

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPlan: PlanItem | null;
  currentDate: string;
  onSuccess: () => void;
}

const PlanFormDialog: React.FC<PlanFormDialogProps> = ({
  open,
  onOpenChange,
  editingPlan,
  currentDate,
  onSuccess,
}) => {
  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      title: '',
      scheduledTime: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: editingPlan?.title ?? '',
        scheduledTime: editingPlan?.scheduledTime ?? '',
      });
    }
  }, [open, editingPlan, form.reset]);

  const onSubmit = async (data: PlanFormData) => {
    try {
      if (editingPlan) {
        await planApi.updatePlan(editingPlan.id, {
          title: data.title,
          scheduledTime: data.scheduledTime || undefined,
        });
        toast.success('计划已更新');
      } else {
        await planApi.createPlan({
          title: data.title,
          scheduledTime: data.scheduledTime || undefined,
          date: currentDate,
        });
        toast.success('计划已添加');
      }
      onSuccess();
    } catch (error) {
      logger.error('Failed to save plan', error);
      toast.error('保存计划失败');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-sm">
        <DialogHeader>
          <DialogTitle>{editingPlan ? '编辑计划' : '添加计划'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>计划内容</FormLabel>
                  <FormControl>
                    <Input placeholder="输入计划内容" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scheduledTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>时间（可选）</FormLabel>
                  <FormControl>
                    <Input placeholder="例如: 09:00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
            >
              {editingPlan ? '保存修改' : '添加'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PlansPage;
