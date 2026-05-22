/**
 * 向量检索服务 — 智谱 Embedding + Supabase pgvector
 *
 * 模型：智谱 embedding-2（256 维）
 * API 格式兼容 OpenAI，直接用 openai npm 包调用
 */

import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

let supabaseClient = null;
let openaiClient = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("[retriever] Supabase 未配置");
    return null;
  }
  supabaseClient = createClient(url, key);
  return supabaseClient;
}

function getEmbeddingClient() {
  if (openaiClient) return openaiClient;
  openaiClient = new OpenAI({
    apiKey: process.env.ZHIPU_API_KEY,
    baseURL: process.env.ZHIPU_BASE_URL,
  });
  return openaiClient;
}

/**
 * 将文本转换为 256 维向量
 */
async function embedText(text) {
  const ai = getEmbeddingClient();
  const result = await ai.embeddings.create({
    model: "embedding-2",
    input: text,
  });
  return result.data[0].embedding; // number[]，256 维
}

/**
 * 检索与用户问题最相关的 topK 个知识片段
 *
 * @param {string} question
 * @param {number} topK
 * @returns {Promise<string[]>}
 */
export async function retrieveContext(question, topK = 3) {
  const supabase = getSupabase();
  if (!supabase) return [];

  // 检查知识库是否为空
  const { count, error: countError } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true });

  if (countError || count === 0) {
    if (count === 0) console.log("[retriever] 知识库为空");
    return [];
  }

  try {
    // 1. 将问题转为向量
    const embedding = await embedText(question);

    // 2. 向量相似度搜索
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_count: topK,
    });

    if (error) throw error;

    console.log(
      `[retriever] 检索完成：${data?.length || 0} 条匹配，最高相似度：${data?.[0] ? (data[0].similarity * 100).toFixed(1) + "%" : "N/A"}`
    );
    return data ? data.map((row) => row.content) : [];
  } catch (error) {
    console.error("[retriever] 检索失败：", error.message);
    return [];
  }
}
