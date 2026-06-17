import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TiptapEditorComplete } from '@/components/business-ui/tiptap-editor';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { diaryApi } from '@/api';

interface DiaryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const DiaryForm: React.FC<DiaryFormProps> = ({
  open,
  onOpenChange,
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('请输入标题');
      return;
    }
    setSubmitting(true);
    try {
      await diaryApi.createDiary({ title, content });
      toast.success('日记已创建');
      setTitle('');
      setContent('');
      onOpenChange(false);
      onCreated();
    } catch (error) {
      logger.error('create diary failed', error);
      toast.error('创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setTitle('');
      setContent('');
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">写日记</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="今天的标题..."
            className="font-serif text-lg border-border rounded-sm focus-visible:ring-1 focus-visible:ring-primary"
          />
          <TiptapEditorComplete
            value={content}
            onValueChange={setContent}
            placeholder="写下今天的感悟..."
            className="max-h-60"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiaryForm;
