# AGENTS.md — AI 入职说明书

> 任何 AI 编码助手（Claude Code、Cursor、Copilot 等）打开本项目时，请首先阅读此文件。

---

## 这是什么项目？

**机务AI排故助手** — 帮助民航机务维修人员输入飞机故障现象，通过 AI（DeepSeek + RAG 知识库）快速获得结构化排故建议的 Web 应用。

- **目标用户**：飞机机电设备维修人员（一线排故工程师）
- **使用场景**：机坪/机库用手机或电脑查询排故方案
- **当前阶段**：MVP Demo（单用户、纯前端可运行、后端待接入）
- **项目负责人**：编程初学者（飞机维修专业大学生），需要代码注释详尽

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + Vite + Tailwind CSS 4 |
| 后端 | Node.js + Express（待搭建） |
| AI 大模型 | DeepSeek V4 Pro（OpenAI 兼容接口） |
| 向量化 | OpenAI text-embedding-3-small（或中转站） |
| 向量数据库 | Supabase + pgvector（待搭建） |
| 编排框架 | LangChain.js（待搭建） |
| 历史存储 | 浏览器 localStorage |

---

## 项目结构

```
f:/AI/AI排故小程序/
├── docs/prd/                 ← 产品需求文档（PRD v0.2）
├── client/                   ← 前端（Vite + React + Tailwind）
│   └── src/
│       ├── App.jsx           ← 主组件，管理页面状态机
│       ├── components/
│       │   ├── Layout.jsx         ← 整体布局 + 侧边栏框架
│       │   ├── SearchBox.jsx      ← 首页搜索输入框
│       │   ├── ResultCard.jsx     ← 排故结果展示（可折叠卡片）
│       │   ├── MenuCard.jsx       ← 侧边栏可展开菜单卡片
│       │   ├── AvatarDropdown.jsx ← 右上角头像下拉
│       │   └── SidebarSection.jsx ← 侧边栏三级折叠组件
│       ├── hooks/useHistory.js    ← localStorage 历史记录管理
│       └── utils/api.js           ← API 调用封装（当前为 mock 数据）
├── server/                   ← 后端（Express + LangChain，待搭建）
├── knowledge/                ← 机务手册 .txt/.md 文件（待准备）
├── import-kb.mjs             ← 知识库导入脚本（待开发）
├── .env.example              ← 环境变量模板
├── AGENTS.md                 ← 本文件
├── CLAUDE.md                 ← Claude 专用规则
└── README.md                 ← 人类阅读的启动指南
```

---

## 如何运行（当前阶段）

### 前端 Demo
```bash
cd client
npm install
npm run dev        # 启动开发服务器 → http://localhost:5173
```

当前 Demo 使用 **mock 数据**，不依赖后端。输入任意故障现象都会返回示例结果。

### 完整运行（后端接入后）
```bash
# 终端 1：后端
cd server
npm install
cp ../.env.example .env    # 编辑 .env 填入 API Key
npm run dev                 # 启动后端 → http://localhost:3001

# 终端 2：前端
cd client
npm run dev                 # 启动前端 → http://localhost:5173
```

---

## 关键设计决策

1. **无需登录**：MVP 为单用户本地使用，无认证系统
2. **API Key 仅存后端**：DeepSeek / OpenAI Key 存在 `server/.env`，前端不可见
3. **移动端优先**：Tailwind 响应式，手机/平板/桌面自适应
4. **mock 数据先行**：前端 `api.js` 用 mock 数据独立运行，便于 UI 开发和调试
5. **历史存 localStorage**：不依赖数据库，上限 50 条

---

## 当前开发进度

| 模块 | 状态 | 备注 |
|------|------|------|
| 前端 UI（搜索/结果/历史/设置） | ✅ 已完成 | Demo 可运行 |
| 前端 mock 数据 | ✅ 已完成 | api.js 返回假数据 |
| 后端 Express API | ❌ 待开发 | /api/query 端点 |
| LangChain 检索链 | ❌ 待开发 | Supabase 向量检索 |
| DeepSeek 调用 | ❌ 待开发 | Prompt 模板 + JSON 解析 |
| 知识库导入脚本 | ❌ 待开发 | import-kb.mjs |
| Supabase 数据库 | ❌ 待搭建 | pgvector + documents 表 |
| README.md | ❌ 待写 | 人类用启动指南 |

---

## 给 AI 的工作建议

- **修改前先读 PRD**：[docs/prd/机务AI排故助手-PRD.md](docs/prd/机务AI排故助手-PRD.md) 包含完整功能规格和分支流程
- **代码注释用中文**：项目负责人是编程初学者，注释要解释"为什么"而非"做什么"
- **先跑起来再说**：MVP 优先，避免过度设计
- **修改组件后刷新浏览器验证**：`http://localhost:5173`
- **不要改 PRD 里的功能范围**：非目标（多用户、权限等）不实现
