import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TiptapEditorComplete } from '@/components/business-ui/tiptap-editor';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { ChevronLeft, Trash2, Edit } from 'lucide-react';
import { diaryApi } from '@/api';
import dayjs from 'dayjs';
import type { DiaryDetail as DiaryDetailType } from '@shared/api.interface';
import { showConfirm } from '@lark-apaas/client-toolkit';

interface DiaryDetailProps {
  diary: DiaryDetailType;
  onBack: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

const DiaryDetail: React.FC<DiaryDetailProps> = ({
  diary,
  onBack,
  onDeleted,
  onUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(diary.title);
  const [editContent, setEditContent] = useState(diary.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim()) {
      toast.error('请输入标题');
      return;
    }
    setSaving(true);
    try {
      await diaryApi.updateDiary(diary.id, {
        title: editTitle,
        content: editContent,
      });
      toast.success('已保存');
      setIsEditing(false);
      onUpdated();
    } catch (error) {
      logger.error('update diary failed', error);
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!await showConfirm('确定删除这篇日记吗？')) return;
    setDeleting(true);
    try {
      await diaryApi.deleteDiary(diary.id);
      toast.success('已删除');
      onDeleted();
    } catch (error) {
      logger.error('delete diary failed', error);
      toast.error('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const handleStartEdit = () => {
    setEditTitle(diary.title);
    setEditContent(diary.content);
    setIsEditing(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          返回
        </Button>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={handleStartEdit}>
              <Edit className="w-4 h-4 mr-1" />
              编辑
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            删除
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-6">
          <input
            value={editTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
            className="w-full font-serif text-xl font-medium bg-transparent border-b border-border pb-2 focus:outline-none focus:border-foreground transition-colors"
            placeholder="标题"
          />
          <TiptapEditorComplete
            key={`edit-${diary.id}`}
            value={editContent}
            onValueChange={setEditContent}
            placeholder="写下你的想法..."
            className="max-h-100"
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {dayjs(diary.createdAt).format('YYYY年M月D日')}
          </p>
          <h1 className="font-serif text-2xl font-medium mb-6">
            {diary.title}
          </h1>
          <div
            className="prose prose-sm max-w-none font-sans leading-relaxed [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&_blockquote]:border-border [&_blockquote]:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: stripHtml(diary.content) === diary.content ? `<p>${diary.content}</p>` : diary.content }}
          />
        </div>
      )}
    </div>
  );
};

export default DiaryDetail;
