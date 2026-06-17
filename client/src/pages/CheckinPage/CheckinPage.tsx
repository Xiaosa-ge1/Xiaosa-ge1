import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { habitApi } from '@client/src/api';
import type { HabitItem } from '@shared/api.interface';

const CheckinPage: React.FC = () => {
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<HabitItem | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const data = await habitApi.getHabits();
      setHabits(data.items);
    } catch (error) {
      logger.error('Failed to load habits', error);
      toast.error('加载习惯列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) {
      toast.error('请输入习惯名称');
      return;
    }

    try {
      await habitApi.createHabit({ name: newHabitName.trim() });
      toast.success('习惯添加成功');
      setNewHabitName('');
      setAddDialogOpen(false);
      await loadHabits();
    } catch (error) {
      logger.error('Failed to create habit', error);
      toast.error('添加习惯失败');
    }
  };

  const handleCheckin = async (habit: HabitItem) => {
    if (habit.todayChecked) {
      return;
    }

    try {
      const result = await habitApi.checkin(habit.id);
      toast.success(`打卡成功！连续 ${result.newStreak} 天`);
      await loadHabits();
    } catch (error) {
      logger.error('Failed to checkin', error);
      toast.error('打卡失败');
    }
  };

  const handleDeleteClick = (habit: HabitItem) => {
    setHabitToDelete(habit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!habitToDelete) return;

    try {
      await habitApi.deleteHabit(habitToDelete.id);
      toast.success('习惯已删除');
      setDeleteDialogOpen(false);
      setHabitToDelete(null);
      await loadHabits();
    } catch (error) {
      logger.error('Failed to delete habit', error);
      toast.error('删除失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">打卡</h1>
          <p className="text-muted-foreground text-sm">坚持好习惯</p>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground italic mb-6">
              开始你的第一个好习惯吧
            </p>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(true)}
              className="border-border"
            >
              <Plus className="size-4 mr-2" />
              添加习惯
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {habits.map((habit) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border border-border rounded-sm p-6 shadow-none">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-foreground font-medium truncate">
                          {habit.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-foreground tabular-nums">
                            {habit.streak}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            天
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleCheckin(habit)}
                            disabled={habit.todayChecked}
                            className="relative w-12 h-12 rounded-full border-2 border-foreground transition-all duration-150 ease-out disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            aria-label={
                              habit.todayChecked ? '已打卡' : '打卡'
                            }
                          >
                            <motion.div
                              initial={false}
                              animate={{
                                scale: habit.todayChecked ? 1 : 0,
                                opacity: habit.todayChecked ? 1 : 0,
                              }}
                              transition={{ duration: 0.15 }}
                              className="absolute inset-1 rounded-full bg-foreground"
                            />
                            {habit.todayChecked && (
                              <Check className="absolute inset-0 m-auto size-5 text-background" />
                            )}
                          </button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(habit)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {habit.todayChecked && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground text-center">
                          已打卡
                        </p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(true)}
              className="w-full border-border mt-6"
            >
              <Plus className="size-4 mr-2" />
              添加习惯
            </Button>
          </div>
        )}

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>添加新习惯</DialogTitle>
              <DialogDescription>
                输入你想要养成的好习惯名称
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <Input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="例如：每天阅读30分钟"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddHabit();
                  }
                }}
                autoFocus
              />

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddDialogOpen(false);
                    setNewHabitName('');
                  }}
                >
                  取消
                </Button>
                <Button onClick={handleAddHabit}>添加</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除习惯「{habitToDelete?.name}」吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setHabitToDelete(null)}>
                取消
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default CheckinPage;
