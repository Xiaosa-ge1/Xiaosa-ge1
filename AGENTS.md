# UI 设计指南

> **设计类型**: App 设计（应用架构设计）
> **确认检查**: 本指南适用于可交互的应用/网站/工具。

> ℹ️ Section 1 为设计意图与决策上下文。Code agent 实现时以 Section 2 及之后的具体参数为准。

## 1. Design Archetype (设计原型)

### 1.1 内容理解（每项一句话，不展开）

- **目标用户**: 个人成长记录者，高频使用管理计划、日记、打卡与收藏
- **核心目的**: 引导行动 + 建立自我掌控感，信息清晰优先于装饰
- **情绪基调**: 克制 / 专注 / 秩序感；避免花哨、焦虑、视觉噪音

### 1.2 设计方向（每项一行）

- **Design Style**: Muji 极简 — 纯黑白诉求+大量留白+极细边框，契合「不要花哨」的个人记录工具
- **Application Type**: Tool/SPA — 移动端优先的个人效率工具，底部 Tab 导航
- **Aesthetic Direction**: 纸张质感般的黑白排版，内容即装饰，框架隐形

## 2. Color System (色彩系统)

> 基于应用概要设计的「纯黑白简约风」推导，照片墙是唯一允许色彩的区域。

**色彩关系**：纯白底 + 墨黑文字 + 浅灰边框/背景层次，零色相装饰
**配色设计理由**：用户明确要求黑白简约、不花哨；黑白最大化突出内容与照片本身
**主色推导**：primary = 纯黑，承载所有关键操作（打卡实心、发送按钮、完成态），语义即行动
**使用比例**：90% 白/浅灰中性底 · 8% 黑色文字与边框 · 2% 纯黑 primary 仅用于实心按钮与激活态

### 2.1 主题颜色

> **Color Token 语义速查（供 code agent 参考）**:
> - `primary` → 主行动：实心按钮、打卡完成、消息气泡（用户）、Tab 激活图标
> - `accent` → 状态反馈：Ghost 按钮 hover、列表项 focus、Skeleton 占位
> - `muted` → 静态非交互：已完成计划文字、次级说明、占位符
> - **选择原则**：用户"可以点击" → primary；交互"正在发生" → accent；内容"不可操作/已完成" → muted

> **命名约定（shadcn/Tailwind）**：变量写作 `--<token>`，引用时用 `bg-<token>` / `text-<token>` / `border-<token>`。下表只给 token 与 HSL 值，class 名按约定推导，无需逐一列出。

| Token                | HSL 值           | 说明                                         |
| -------------------- | ---------------- | -------------------------------------------- |
| `background`         | hsl(0 0% 100%)   | 纯白页面底色                                 |
| `card`               | hsl(0 0% 100%)   | 卡片背景，与页面同色靠边框区分               |
| `foreground`         | hsl(0 0% 7%)     | 主文字，近黑而非纯黑减少视觉疲劳             |
| `muted-foreground`   | hsl(0 0% 55%)    | 次要文字、已完成态、时间戳                   |
| `primary`            | hsl(0 0% 7%)     | 主交互色，与 foreground 同色保持黑白纯粹     |
| `primary-foreground` | hsl(0 0% 100%)   | 主按钮文字、用户消息气泡文字                 |
| `accent`             | hsl(0 0% 96%)    | 次级交互反馈，极浅灰 hover/focus/skeleton    |
| `accent-foreground`  | hsl(0 0% 7%)     | accent 上的文字                              |
| `border`             | hsl(0 0% 90%)    | 极细分割线与卡片边框                         |

### 2.2 Sidebar 颜色

> 不适用。Navigation Type 为 Bottom Tab Bar，无 Sidebar。

### 2.3 Topbar/Header 设计策略

> 定义时机：顶部日期栏/标题栏使用主配色系统。

- **背景策略**: `bg-background` + 底部 `border-border`，无阴影
- **文字/图标**: 默认 `text-foreground`；激活/当前页 `text-primary font-semibold`
- **边框与分隔**: 底部 `border-b border-border` 1px 细线

### 2.4 语义颜色（可选）

> 本应用为纯黑白风格，不定义彩色语义色。成功/错误通过文字变化+图标表达：
> - 完成/成功：`text-muted-foreground line-through`（计划）或实心圆（打卡）
> - 空状态引导：`text-muted-foreground italic`

## 3. Typography (字体排版)

- **Heading**: "Noto Serif SC", "Source Han Serif CN", serif
- **Body**: "Inter", "Noto Sans SC", system-ui, sans-serif
- **字体策略**: 标题用衬线体营造手账仪式感与日记温度；正文用无衬线确保列表/数据可读性；数字使用 tabular-nums 对齐

## 4. Layout Strategy (布局策略)

- **导航策略**: Bottom Tab Bar — 移动端个人工具标配，7 个模块需精简为首页/计划/打卡/AI/更多（含日记/照片墙/收藏）
- **页面架构**: 单列流式布局，内容区 `max-w-lg mx-auto` 居中约束阅读宽度
- **响应式**: 移动端全宽；桌面端内容区居中 max-w-lg，两侧留白，Tab 不变

## 5. Visual Language (视觉语言)

> Muji 极简 DNA 参数落实。

- **形态参数**: 圆角 `rounded-sm (0.125rem)` · 阴影 `shadow-none` · 间距基调 `spacious (gap-6/p-6)`
- **识别签名**: ① 所有卡片 1px border + 无阴影 ② 打卡按钮空心↔实心圆形切换 ③ 大号 tabular-nums 连续天数
- **装饰策略**: 零装饰；分割线用 `border-border` 极细线；唯一视觉变化来自内容本身
- **动效原则**: 克制微交互，150ms ease-out；删除线划入、打卡填充实心、照片淡入
- **可及性**: 前景/背景对比度 ≥ 15:1；触摸目标 ≥ 44px；focus-visible 用 `ring-1 ring-primary`

## 6. Component Principles (组件原则)

- **状态完整性**: 按钮 Default/Hover/Focus/Disabled；打卡按钮空心(Default)/实心(Active)/过渡动画；计划条目未完成/已完成(line-through+muted)
- **层级清晰**: Primary 按钮 = 实心黑底白字；Secondary/Ghost = 透明底+border；表单 Focus = `ring-1 ring-primary`
- **一致性**: 所有卡片统一 `border border-border rounded-sm p-6`；列表项统一 `py-4 border-b border-border last:border-0`；颜色只用 Color System 语义角色

## 7. Image Direction (图片与视觉资产)

- **Image Role**: 仅照片墙页面承载用户上传图片；其余页面无 Hero/插画/背景图
- **Image Art Direction**: 照片墙网格等高排列，1px gap-border 分隔，地点标签 `text-xs text-muted-foreground` 置于图下方；大图查看时纯黑遮罩 `bg-black/90`
- **Image Prompt Keywords**: 无（用户上传内容，非生成资产）
- **Image Avoidance**: 禁止占位图/默认素材/渐变背景；照片墙为空时显示文字引导而非插图

## 9. Application Architecture

### Pages & Routes
| Page | Route | Component | Description |
|------|-------|-----------|-------------|
| 首页 | `/` | HomePage | 今日计划/打卡/日记概览 |
| 计划 | `/plans` | PlansPage | 每日计划 CRUD |
| 日记 | `/diary` | DiaryPage | 日记时间线 |
| 打卡 | `/checkin` | CheckinPage | 习惯打卡 |
| AI 聊天 | `/ai-chat` | AiChatPage | AI 对话+智能生成 |
| 照片墙 | `/photo-wall` | PhotoWallPage | 照片记录 |
| 收藏 | `/favorites` | FavoritesPage | 文章/视频收藏 |

### Navigation
- Bottom Tab Bar: 首页 / 计划 / 打卡 / AI / 更多(日记+照片墙+收藏)
- 激活态: primary 色 + 加粗字重

### Server Modules
| Module | Controller Prefix | Description |
|--------|------------------|-------------|
| HomeModule | `api/home` | 首页聚合查询 |
| PlanModule | `api/plans` | 计划 CRUD + 批量创建 |
| DiaryModule | `api/diary` | 日记 CRUD |
| HabitModule | `api/habits` | 习惯 CRUD + 打卡 |
| PhotoModule | `api/photos` | 照片 CRUD |
| FavoriteModule | `api/favorites` | 收藏 CRUD |

### Parallel Development Boundaries
- **禁止编辑的聚合文件**: `server/app.module.ts`, `client/src/app.tsx`, `client/src/api/index.ts`
- 各模块只修改自己的目录: `server/modules/<name>/`, `client/src/pages/<Name>Page/`, `client/src/api/<name>.ts`
- 共享类型修改集中在 `shared/api.interface.ts`

- ❌ 任何彩色元素（包括语义色、渐变、彩色图标）— 违背「纯黑白」核心约束
- ❌ 卡片阴影/毛玻璃/圆角过大 — 破坏 Muji 极简的锐利纸张感
- ❌ AI 聊天界面使用彩色头像/机器人图标 — 应保持黑白文字气泡对比，头像可用纯黑圆形+白色首字母