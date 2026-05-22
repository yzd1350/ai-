/**
 * 知识库导入脚本（智谱 Embedding 向量化）
 *
 * 用法：cd server && node --max-old-space-size=4096 import-kb.mjs
 *
 * 将 ../knowledge/ 下的 .txt/.md 文件：
 *   1. 分段 → 2. 智谱 embedding 向量化 → 3. 存入 Supabase
 */

// 直接设置环境变量（dotenv 与 openai 在 .mjs 文件中有内存冲突）
process.env.SUPABASE_URL = "https://tnvrmmtbueojazywqpdc.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRudnJtbXRidWVvamF6eXdxcGRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2Mjg2NSwiZXhwIjoyMDk1MDM4ODY1fQ.ZKz_86B98riiOtFEiA3cnPtFBUpWeUN9Do3n0CJvyK0";
process.env.ZHIPU_API_KEY = "edca98dcb54b4cdbbf931054581c1384.GxXZd0iRHwCLSTkP";
process.env.ZHIPU_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname, basename } from "path";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const KNOWLEDGE_DIR = join(process.cwd(), "..", "knowledge");
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ server/.env 中缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const ai = new OpenAI({
  apiKey: process.env.ZHIPU_API_KEY,
  baseURL: process.env.ZHIPU_BASE_URL,
});

function listFiles(dir) {
  try {
    return readdirSync(dir)
      .map((f) => ({ path: join(dir, f), name: f }))
      .filter(
        ({ path, name }) =>
          statSync(path).isFile() &&
          [".txt", ".md"].includes(extname(name).toLowerCase())
      );
  } catch {
    console.error(`❌ 目录不存在: ${dir}`);
    process.exit(1);
  }
}

function readText(filePath) {
  try { return readFileSync(filePath, "utf-8"); }
  catch { console.warn(`⚠️  跳过 ${basename(filePath)}`); return null; }
}

function splitText(text) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + CHUNK_SIZE, text.length);
    if (end < text.length) {
      for (const bp of ["\n\n", "\n", "。", "；", "，"]) {
        const idx = text.lastIndexOf(bp, end);
        if (idx > start + CHUNK_SIZE * 0.6) { end = idx + bp.length; break; }
      }
    }
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 10) chunks.push(chunk);
    start = end - CHUNK_OVERLAP;
    // 文本短于 CHUNK_SIZE 时避免死循环
    if (end >= text.length) break;
  }
  return chunks;
}

async function main() {
  console.log("\n📚 知识库导入（智谱 Embedding）\n");

  const files = listFiles(KNOWLEDGE_DIR);
  if (files.length === 0) {
    console.log("❌ knowledge/ 目录中没有 .txt 或 .md 文件\n");
    process.exit(1);
  }

  console.log(`📄 找到 ${files.length} 个文件:\n`);
  files.forEach((f) => console.log(`   - ${f.name}`));

  // 清空旧数据
  const { count } = await supabase.from("documents").select("*", { count: "exact", head: true });
  if (count > 0) {
    console.log(`\n🗑️  清空旧数据 (${count} 条)...`);
    // 逐条删除以避免内存问题
    const { data: all } = await supabase.from("documents").select("id");
    if (all) {
      for (const row of all) {
        await supabase.from("documents").delete().eq("id", row.id);
      }
    }
  }

  let total = 0;
  for (const file of files) {
    console.log(`\n📖 ${file.name}`);

    const stat = statSync(file.path);
    if (stat.size > 10 * 1024 * 1024) { console.log("   ⚠️  跳过（超过 10MB）"); continue; }

    const content = readText(file.path);
    if (!content) continue;

    const chunks = splitText(content);
    console.log(`   ${chunks.length} 个片段，正在向量化...`);

    for (let i = 0; i < chunks.length; i++) {
      try {
        const result = await ai.embeddings.create({
          model: "embedding-2",
          input: chunks[i],
        });
        const embedding = result.data[0].embedding;

        await supabase.from("documents").insert({
          content: chunks[i],
          embedding,
          metadata: { source: file.name, chunkIndex: i },
        });

        total++;
        if ((i + 1) % 5 === 0) process.stdout.write(`   ${i + 1}/${chunks.length}\r`);
      } catch (err) {
        console.warn(`   ⚠️  片段 ${i} 失败: ${err.message}`);
      }
    }
    console.log(`   ✅ 完成 (${Math.min(chunks.length, total)} 条)`);
  }

  console.log(`\n✅ 导入完成！共 ${total} 个片段已入库\n`);
}

main().catch((err) => { console.error("\n❌", err.message); process.exit(1); });
