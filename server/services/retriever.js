/**
 * 知识库检索服务
 *
 * 当前方案：PostgreSQL ILIKE 关键词模糊匹配（免 embedding 模型，国内网络友好）
 * 后续可升级为 pgvector 向量检索（需配置 embedding 服务）
 */

import { createClient } from "@supabase/supabase-js";

let client = null;

function getClient() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("[retriever] Supabase 未配置");
    return null;
  }
  client = createClient(url, key);
  return client;
}

/**
 * 从中文问题中提取有意义的搜索关键词
 */
function extractKeywords(text) {
  const stopWords = new Set([
    "的", "了", "在", "是", "我", "有", "和", "就", "不", "人", "都", "一",
    "上", "也", "很", "到", "要", "去", "你", "会", "着", "没有", "看", "好",
    "什么", "怎么", "如何", "为什么", "请问", "出现", "发生", "导致",
    "帮", "看看", "一下", "这个", "那个", "帮忙", "分析",
  ]);

  const cleaned = text.replace(/[，。！？、；：""（）【】《》\s,.!?;:'"()\[\]{}<>\/\\|@#$%^&*+=~`-]+/g, " ");
  const words = cleaned.split(/\s+/).filter((w) => w.length >= 2 && !stopWords.has(w));
  words.sort((a, b) => b.length - a.length);
  return words.slice(0, 5);
}

/**
 * 搜索与用户问题最相关的知识片段
 *
 * @param {string} question
 * @param {number} topK - 返回数量，默认 3
 * @returns {Promise<string[]>}
 */
export async function retrieveContext(question, topK = 3) {
  const supabase = getClient();
  if (!supabase) return [];

  // 检查知识库是否为空
  const { count, error: countError } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true });

  if (countError || count === 0) {
    if (count === 0) console.log("[retriever] 知识库为空，请先导入知识文档");
    return [];
  }

  const keywords = extractKeywords(question);
  if (keywords.length === 0) return [];

  try {
    // 多个关键词用 OR 拼接做模糊匹配
    const orClause = keywords.map((kw) => `content.ilike.%${kw}%`).join(",");
    const { data, error } = await supabase
      .from("documents")
      .select("content")
      .or(orClause)
      .limit(topK);

    if (error) throw error;

    console.log(`[retriever] 匹配 ${data?.length || 0} 条（关键词：${keywords.join(", ")}）`);
    return data ? data.map((d) => d.content) : [];
  } catch (error) {
    console.error("[retriever] 检索失败：", error.message);
    return [];
  }
}
