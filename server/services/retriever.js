/**
 * 向量检索服务 — 在 Supabase 知识库中搜索最相关的文档片段
 *
 * 依赖：
 *   - OpenAI Embeddings API（文本 → 向量）
 *   - Supabase pgvector（向量相似度搜索）
 *
 * 如果 Supabase 未配置，返回空数组（降级为纯模型回答）
 */

import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";

let vectorStore = null; // 缓存实例，避免重复创建

/**
 * 初始化向量存储连接（惰性初始化，只在首次查询时连接）
 */
function getVectorStore() {
  if (vectorStore) return vectorStore;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("[retriever] Supabase 未配置，知识库检索不可用");
    return null;
  }

  const client = createClient(supabaseUrl, supabaseKey);

  // OpenAI Embeddings 配置
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
    configuration: {
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    },
  });

  vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: "documents",
    queryName: "match_documents",
  });

  return vectorStore;
}

/**
 * 检索与用户问题最相关的 topK 个知识片段
 * @param {string} question - 用户输入的故障问题
 * @param {number} topK - 返回的片段数量，默认 3
 * @returns {Promise<string[]>} 检索到的文本片段数组
 */
export async function retrieveContext(question, topK = 3) {
  const store = getVectorStore();

  // Supabase 未配置 → 降级为空检索
  if (!store) {
    console.log("[retriever] 知识库未配置，跳过向量检索");
    return [];
  }

  try {
    const results = await store.similaritySearch(question, topK);

    if (results.length === 0) {
      console.log("[retriever] 检索完成：0 条匹配");
      return [];
    }

    console.log(
      `[retriever] 检索完成：${results.length} 条匹配，最高相似度：${(results[0]?.metadata?.similarity || 0).toFixed(3)}`
    );
    return results.map((doc) => doc.pageContent);
  } catch (error) {
    console.error("[retriever] 检索失败：", error.message);
    return []; // 检索失败不抛错，降级为纯模型回答
  }
}
