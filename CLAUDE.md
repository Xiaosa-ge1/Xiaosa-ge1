# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此仓库中工作提供指导。

## 项目概述

Fullstack NestJS 模板 v2.2.5 — 个人成长追踪应用（计划、日记、习惯打卡、照片墙、收藏、AI 聊天）。NestJS 后端渲染 React SPA 客户端。

## 架构

- **`server/`** — NestJS 后端（TypeScript, PostgreSQL + Drizzle ORM）
- **`client/`** — React 19 SPA（Vite 7, Tailwind CSS 4, shadcn/ui, React Router 6）
- **`shared/`** — 共享 TypeScript 类型（`api.interface.ts`, `plugin-types.ts`）

### 服务端（NestJS）

每个模块遵循扁平结构：`module.ts`、`controller.ts`、`service.ts`，位于 `server/modules/<name>/`。

| 模块 | 路由前缀 | 用途 |
|------|----------|------|
| Home | `api/home` | 首页聚合查询 |
| Plan | `api/plans` | 计划 CRUD + 批量创建 |
| Diary | `api/diary` | 日记 CRUD |
| Habit | `api/habits` | 习惯 CRUD + 打卡 |
| Photo | `api/photos` | 照片 CRUD |
| Favorite | `api/favorites` | 收藏 CRUD |
| View | — | 兜底路由（必须在 imports 最后） |

通用工具在 `server/common/`（过滤器、常量、接口）。数据库 schema 在 `server/database/schema.ts`（自动生成，Drizzle ORM + PostgreSQL）。AI 能力定义在 `server/capabilities/*.json`。

### 客户端（React）

页面位于 `client/src/pages/<Name>Page/`，API 层在 `client/src/api/<name>.ts`，共享 UI 组件在 `client/src/components/ui/`（shadcn/ui/Radix 组件）。业务组件在 `client/src/components/business-ui/`。

### 路径别名

- `@/` → `client/src/`（客户端导入）
- `@server/` → `server/`
- `@client/` → `client/`
- `@shared/` → `shared/`

### 开发边界（⚠️ 禁止编辑）

- `server/app.module.ts` — 模块注册文件
- `client/src/app.tsx` — 路由配置
- `client/src/api/index.ts` — API 导出聚合

每个模块只修改自己的目录：`server/modules/<name>/`、`client/src/pages/<Name>Page/`、`client/src/api/<name>.ts`。共享类型集中在 `shared/api.interface.ts`。

### UI 设计系统

Muji 极简黑白风格。完整设计规范见 `AGENTS.md`。关键 token 使用 shadcn HSL 变量（`--background`、`--foreground`、`--primary` 等）。卡片使用 `border border-border rounded-sm p-6`，无阴影。底部 Tab 导航包含 4 个主 Tab + "更多" 展开。

## 命令

```bash
# 开发
npm run dev              # 同时启动服务端和客户端
npm run dev:server       # 仅启动服务端（NestJS watch 模式）
npm run dev:client       # 仅启动客户端（Vite 开发服务器）

# 构建
npm run build            # 生产构建
npm run build:server     # NestJS 生产构建
npm run build:client     # Vite 生产构建

# 测试
npm test                 # 运行 Jest 测试（匹配 server/**/*.spec.ts, test/unit/**/*.spec.ts）
npm run test:e2e         # E2E 测试（jest --config test/e2e/jest.config.js）
npm run test:watch       # Jest watch 模式

# 代码检查与格式化
npm run lint             # ESLint + Stylelint
npm run eslint           # 仅 ESLint
npm run stylelint        # 仅 Stylelint（client/src/**/*.css）
npm run type:check       # 同时运行服务端和客户端的 tsc --noEmit
npm run format           # Prettier 格式化

# 数据库
npm run gen:db-schema    # 从数据库自动生成 Drizzle schema
```

## 技术栈

- **服务端**: NestJS 10, Drizzle ORM 0.44, PostgreSQL, class-validator, class-transformer
- **客户端**: React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4, shadcn/ui（Radix 组件）
- **状态管理**: TanStack React Query, React Hook Form + Zod, Zustand 5, Redux Toolkit
- **UI**: Framer Motion, TipTap 编辑器, ECharts, GSAP, react-router-dom 6, sonner 通知
- **AI**: 平台 AI 插件（`textGenerate`/`textToJson` 能力）
- **测试**: Jest 29 + ts-jest
