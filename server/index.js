/**
 * 机务AI排故助手 — 后端入口
 *
 * 启动 Express 服务器，加载路由。
 * 使用 node --watch index.js 启动开发模式（文件修改自动重启）。
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import queryRouter from "./routes/query.js";

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors()); // 允许前端跨域请求
app.use(express.json()); // 解析 JSON 请求体

// 路由
app.use(queryRouter);

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    deepseekConfigured: !!process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== "sk-placeholder",
    supabaseConfigured: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
});

app.listen(PORT, () => {
  console.log(`\n🔧 机务AI排故助手后端已启动`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   健康检查：http://localhost:${PORT}/api/health\n`);

  // 启动时检查配置状态
  if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === "sk-placeholder") {
    console.log("⚠️  DeepSeek API Key 未配置，将使用 Mock 数据");
    console.log("   请在 server/.env 中设置 DEEPSEEK_API_KEY\n");
  }
  if (!process.env.SUPABASE_URL) {
    console.log("⚠️  Supabase 未配置，知识库检索不可用");
    console.log("   请在 server/.env 中设置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY\n");
  }
});
