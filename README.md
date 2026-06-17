# 听瓜

一个兼容 Eazo 平台的 Next.js App：前端录音敲瓜声，后端提取 WAV 音频特征，再用本地规则 + Eazo 内置 AI 给出西瓜成熟度评分。

## 技术栈

- Next.js 16 + App Router
- React 19 + TypeScript
- Tailwind CSS v4
- Bun
- Drizzle ORM + PostgreSQL
- `@eazo/sdk`（Auth / AI / Memory）
- shadcn/ui + Framer Motion + lucide-react

## 目录结构

```
src/
  app/                    # 页面与 API 路由
    api/
      analyze/route.ts    # 分析敲瓜声
      history/route.ts    # 查询历史
      user/profile/route.ts # 用户持久化
      mcp/route.ts        # MCP server endpoint
    layout.tsx
    page.tsx
  components/
    watermelon/           # 主界面组件
    user-profile/         # 用户同步
    ui/                   # shadcn 组件
  lib/
    audio-analysis.ts     # 核心声学分析
    audio-encoder.ts      # WAV 编码
    ai-assessment.ts      # AI 复核评分
    api/                  # 客户端 API 调用
    auth/                 # requireAuth 重导出
    db/                   # Drizzle schema + queries
    i18n/                 # 中英文文案
    mcp/                  # MCP server + tools
    memory.ts             # memory.reportAction 埋点
```

## 本地开发

```bash
bun install
bun dev
```

访问 `http://localhost:3000`。

## 数据库

```bash
bun run db:generate
bun run db:migrate
```

## 环境变量

复制 `.env.example` 为 `.env`，填入平台注入的变量：

```bash
EAZO_APP_ID=
EAZO_PRIVATE_KEY=
DATABASE_URL=
```

## MCP

Cursor / Claude Desktop 配置：

```json
{
  "mcpServers": {
    "watermelon": {
      "url": "http://localhost:3000/api/mcp",
      "headers": { "x-eazo-session": "<your-session>" }
    }
  }
}
```
