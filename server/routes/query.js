/**
 * POST /api/query 路由
 *
 * 处理排故请求的完整流程：
 *   1. 校验用户输入
 *   2. 向量检索知识库 → 取 top 3 片段
 *   3. 构造 prompt → 调用 DeepSeek
 *   4. 返回结构化 JSON 给前端
 */

import { Router } from "express";
import { retrieveContext } from "../services/retriever.js";
import { askDeepSeek } from "../services/llm.js";
import { buildMessages } from "../prompts/troubleshoot.js";

const router = Router();

router.post("/api/query", async (req, res) => {
  try {
    // 1. 校验输入
    const { question } = req.body;
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: "请提供有效的故障现象描述",
      });
    }

    const trimmedQuestion = question.trim().slice(0, 2000); // 截断过长输入
    console.log(`[query] 收到问题：${trimmedQuestion.slice(0, 80)}...`);

    // 2. 向量检索知识库（取 top 3 相关片段）
    const contextChunks = await retrieveContext(trimmedQuestion, 3);

    // 3. 构造对话消息
    const messages = buildMessages(trimmedQuestion, contextChunks);

    // 4. 调用 DeepSeek 生成回答
    const data = await askDeepSeek(messages);

    // 5. 返回结果
    res.json({
      success: true,
      data,
      // 附加信息：是否使用了知识库
      meta: {
        contextUsed: contextChunks.length > 0,
        contextCount: contextChunks.length,
      },
    });
  } catch (error) {
    console.error("[query] 处理失败：", error.message);

    // 根据错误类型返回对应的错误码和提示
    const errorMap = {
      AI_TIMEOUT: { status: 504, message: "AI 服务响应超时，请稍后重试" },
      AUTH_FAILED: { status: 500, message: "API Key 无效，请检查 server/.env 配置" },
      DB_CONNECTION_FAILED: { status: 500, message: "知识库连接失败，请检查网络和 Supabase 配置" },
    };

    const mapped = errorMap[error.message];
    if (mapped) {
      return res.status(mapped.status).json({
        success: false,
        error: mapped.message,
      });
    }

    // 未知错误
    res.status(500).json({
      success: false,
      error: "服务器内部错误，请稍后重试",
    });
  }
});

export default router;
