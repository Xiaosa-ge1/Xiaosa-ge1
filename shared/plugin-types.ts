// ---- plugin:ai_generate_diary_1 ----
// ============================================================
// 插件 ai_generate_diary_1 (AI生成日记) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface AiGenerateDiaryOneInput {
  /** 需要整理为日记的聊天对话内容 */
  chat_content: string;
}

/**
 * capabilityClient.load('ai_generate_diary_1').call<AiGenerateDiaryOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, response } = result;
 */
export interface AiGenerateDiaryOneOutput {
  /** [object Object] */
  content: string;
  /** [object Object] */
  response?: string;
}
// ---- end:ai_generate_diary_1 ----

// ---- plugin:personal_growth_ai_assistant_1 ----
// ============================================================
// 插件 personal_growth_ai_assistant_1 (个人成长AI对话助手) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface PersonalGrowthAiAssistantOneInput {
  /** 用户提出的问题或表达的需求 */
  user_question: string;
  /** 之前的对话历史上下文，用于保持多轮对话的连贯性 */
  conversation_history?: string;
}

/**
 * capabilityClient.load('personal_growth_ai_assistant_1').call<PersonalGrowthAiAssistantOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, response } = result;
 */
export interface PersonalGrowthAiAssistantOneOutput {
  /** [object Object] */
  content: string;
  /** [object Object] */
  response?: string;
}
// ---- end:personal_growth_ai_assistant_1 ----

// ---- plugin:generate_structured_schedule_plan_1 ----
// ============================================================
// 插件 generate_structured_schedule_plan_1 (AI生成结构化计划插件) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface GenerateStructuredSchedulePlanOneInput {
  /** 包含计划信息的对话上下文文本 */
  conversation_context: string;
}

/**
 * capabilityClient.load('generate_structured_schedule_plan_1').call<GenerateStructuredSchedulePlanOneOutput>('textToJson', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { title, scheduledTime, date } = result;
 */
export interface GenerateStructuredSchedulePlanOneOutput {
  /** 计划标题，字符串类型 */
  title: string;
  /** 计划时间，格式为HH:MM，如09:00 */
  scheduledTime: string;
  /** 计划日期，格式为YYYY-MM-DD，如2026-06-15 */
  date: string;
}
// ---- end:generate_structured_schedule_plan_1 ----