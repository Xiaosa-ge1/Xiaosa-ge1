import React, { useState, useRef, useEffect, useCallback } from 'react';
import { capabilityClient } from '@lark-apaas/client-toolkit';
import { Streamdown } from '@client/src/components/ui/streamdown';
import { planApi, diaryApi } from '@client/src/api';
import { Button } from '@client/src/components/ui/button';
import { Textarea } from '@client/src/components/ui/textarea';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import dayjs from 'dayjs';
import { Send, CalendarDays, BookOpen, Save, Loader2 } from 'lucide-react';
import type { CreatePlanRequest } from '@shared/api.interface';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isStreaming?: boolean;
  isPlan?: boolean;
  isDiary?: boolean;
  saved?: boolean;
}

const WELCOME_MSG = '你好，我是你的成长助手。聊聊今天的感受吧，我可以帮你整理成日记或制定计划。';

function buildConversationHistory(messages: Message[]): string {
  return messages
    .filter((m: Message) => !m.isStreaming)
    .map((m: Message) => `${m.role === 'user' ? '用户' : '助手'}：${m.content}`)
    .join('\n');
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const AiChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'ai', content: WELCOME_MSG },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPlanGenerating, setIsPlanGenerating] = useState<boolean>(false);
  const [isDiaryGenerating, setIsDiaryGenerating] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isGenerating) return;

    const userMsg: Message = { id: generateId(), role: 'user', content: text };
    const aiMsgId = generateId();
    const aiMsg: Message = { id: aiMsgId, role: 'ai', content: '', isStreaming: true };

    setMessages((prev: Message[]) => [...prev, userMsg, aiMsg]);
    setInputValue('');
    setIsGenerating(true);

    try {
      const history = buildConversationHistory([...messages, userMsg]);
      const stream = capabilityClient
        .load('personal_growth_ai_assistant_1')
        .callStream('textGenerate', {
          user_question: text,
          conversation_history: history,
        });

      let fullText = '';
      for await (const chunk of stream) {
        fullText += (chunk as { content?: string }).content || '';
        setMessages((prev: Message[]) =>
          prev.map((m: Message) =>
            m.id === aiMsgId ? { ...m, content: fullText } : m,
          ),
        );
      }

      setMessages((prev: Message[]) =>
        prev.map((m: Message) =>
          m.id === aiMsgId ? { ...m, isStreaming: false, content: fullText } : m,
        ),
      );
    } catch (error) {
      logger.error('AI chat stream failed', error);
      toast.error('AI 回复失败，请重试');
      setMessages((prev: Message[]) =>
        prev.filter((m: Message) => m.id !== aiMsgId),
      );
    } finally {
      setIsGenerating(false);
    }
  }, [inputValue, isGenerating, messages]);

  const handleGeneratePlans = useCallback(async () => {
    if (isPlanGenerating || isGenerating) return;
    const conversationText = buildConversationHistory(messages);
    if (!conversationText) return;

    setIsPlanGenerating(true);
    const aiMsgId = generateId();
    const aiMsg: Message = {
      id: aiMsgId,
      role: 'ai',
      content: '正在分析对话，为你生成计划...',
      isPlan: true,
    };
    setMessages((prev: Message[]) => [...prev, aiMsg]);

    try {
      const result = await capabilityClient
        .load('generate_structured_schedule_plan_1')
        .call('textToJson', {
          conversation_context: conversationText,
        });

      const planResult = result as { title: string; scheduledTime: string; date: string };
      const planList = Array.isArray(planResult) ? planResult : [planResult];
      const today = dayjs().format('YYYY-MM-DD');

      const lines = planList
        .map(
          (p: { title: string; scheduledTime?: string; date?: string }, i: number) =>
            `${i + 1}. **${p.title}**${p.scheduledTime ? ` — ${p.scheduledTime}` : ''}`,
        )
        .join('\n');

      const plansPayload: CreatePlanRequest[] = planList.map(
        (p: { title: string; scheduledTime?: string; date?: string }) => ({
          title: p.title,
          scheduledTime: p.scheduledTime || undefined,
          date: p.date || today,
        }),
      );

      setMessages((prev: Message[]) =>
        prev.map((m: Message) =>
          m.id === aiMsgId
            ? {
                ...m,
                content: `📋 **生成的计划：**\n\n${lines}`,
                isPlan: true,
              }
            : m,
        ),
      );

      setMessages((prev: Message[]) => [
        ...prev,
        {
          id: generateId(),
          role: 'ai',
          content: JSON.stringify({ type: 'plan_actions', plans: plansPayload }),
          isPlan: true,
        },
      ]);
    } catch (error) {
      logger.error('Generate plans failed', error);
      toast.error('生成计划失败，请重试');
      setMessages((prev: Message[]) => prev.filter((m: Message) => m.id !== aiMsgId));
    } finally {
      setIsPlanGenerating(false);
    }
  }, [messages, isPlanGenerating, isGenerating]);

  const handleSavePlans = useCallback(async (plans: CreatePlanRequest[]) => {
    try {
      await planApi.batchCreatePlans({ plans });
      toast.success('计划已保存');
      setMessages((prev: Message[]) =>
        prev.map((m: Message) => (m.isPlan ? { ...m, saved: true } : m)),
      );
    } catch (error) {
      logger.error('Save plans failed', error);
      toast.error('保存计划失败');
    }
  }, []);

  const handleGenerateDiary = useCallback(async () => {
    if (isDiaryGenerating || isGenerating) return;
    const conversationText = buildConversationHistory(messages);
    if (!conversationText) return;

    setIsDiaryGenerating(true);
    const aiMsgId = generateId();
    const aiMsg: Message = {
      id: aiMsgId,
      role: 'ai',
      content: '',
      isStreaming: true,
      isDiary: true,
    };
    setMessages((prev: Message[]) => [...prev, aiMsg]);

    try {
      const stream = capabilityClient
        .load('ai_generate_diary_1')
        .callStream('textGenerate', {
          chat_content: conversationText,
        });

      let fullText = '';
      for await (const chunk of stream) {
        fullText += (chunk as { content?: string }).content || '';
        setMessages((prev: Message[]) =>
          prev.map((m: Message) =>
            m.id === aiMsgId ? { ...m, content: fullText } : m,
          ),
        );
      }

      setMessages((prev: Message[]) =>
        prev.map((m: Message) =>
          m.id === aiMsgId ? { ...m, content: fullText, isStreaming: false } : m,
        ),
      );
    } catch (error) {
      logger.error('Generate diary failed', error);
      toast.error('生成日记失败，请重试');
      setMessages((prev: Message[]) => prev.filter((m: Message) => m.id !== aiMsgId));
    } finally {
      setIsDiaryGenerating(false);
    }
  }, [messages, isDiaryGenerating, isGenerating]);

  const handleSaveDiary = useCallback(async (content: string) => {
    try {
      const lines = content.split('\n').filter((l: string) => l.trim());
      const title = lines[0]?.replace(/^#+\s*/, '') || '日记';
      const body = lines.slice(1).join('\n');
      await diaryApi.createDiary({ title, content: body || content });
      toast.success('日记已保存');
      setMessages((prev: Message[]) =>
        prev.map((m: Message) => (m.isDiary && !m.isStreaming ? { ...m, saved: true } : m)),
      );
    } catch (error) {
      logger.error('Save diary failed', error);
      toast.error('保存日记失败');
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasConversation = messages.filter((m: Message) => m.role === 'user').length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-background">
      <div className="flex-1 overflow-y-auto py-4 px-4">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.map((msg: Message) => {
            if (msg.isPlan && msg.content.startsWith('{')) {
              try {
                const actionData = JSON.parse(msg.content);
                if (actionData.type === 'plan_actions' && !msg.saved) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-xs gap-1.5 rounded-sm"
                        onClick={() => handleSavePlans(actionData.plans)}
                      >
                        <Save className="w-3 h-3" />
                        保存到计划
                      </Button>
                    </div>
                  );
                }
                if (actionData.type === 'plan_actions' && msg.saved) {
                  return (
                    <p key={msg.id} className="text-center text-xs text-muted-foreground">
                      已保存到计划
                    </p>
                  );
                }
              } catch {
                return null;
              }
            }
            if (msg.isPlan && msg.content.startsWith('{')) return null;

            return (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card border border-border rounded-bl-none'
                  }`}
                >
                  {msg.isStreaming ? (
                    msg.content ? (
                      <Streamdown>{msg.content}</Streamdown>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        思考中...
                      </div>
                    )
                  ) : (
                    <Streamdown>{msg.content}</Streamdown>
                  )}
                  {msg.isDiary && !msg.isStreaming && !msg.saved && msg.content && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-xs gap-1.5 rounded-sm"
                        onClick={() => handleSaveDiary(msg.content)}
                      >
                        <Save className="w-3 h-3" />
                        保存日记
                      </Button>
                    </div>
                  )}
                  {msg.isDiary && !msg.isStreaming && msg.saved && (
                    <p className="mt-2 text-xs text-muted-foreground">已保存到日记</p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {hasConversation && (
        <div className="border-t border-border px-4 py-2">
          <div className="max-w-lg mx-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border text-xs gap-1.5 rounded-sm"
              onClick={handleGeneratePlans}
              disabled={isPlanGenerating || isGenerating}
            >
              {isPlanGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <CalendarDays className="w-3 h-3" />
              )}
              生成计划
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-xs gap-1.5 rounded-sm"
              onClick={handleGenerateDiary}
              disabled={isDiaryGenerating || isGenerating}
            >
              {isDiaryGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <BookOpen className="w-3 h-3" />
              )}
              生成日记
            </Button>
          </div>
        </div>
      )}

      <div className="border-t border-border p-4">
        <div className="max-w-lg mx-auto flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="说说你的想法..."
            className="min-h-[40px] max-h-[120px] resize-none rounded-sm border-border focus-visible:ring-1 focus-visible:ring-primary"
            rows={1}
            disabled={isGenerating}
          />
          <Button
            size="icon"
            className="shrink-0 rounded-sm bg-primary text-primary-foreground h-10 w-10"
            onClick={handleSend}
            disabled={!inputValue.trim() || isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiChatPage;
