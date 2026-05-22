/**
 * 知识库导入脚本
 *
 * 用法：cd server && node import-kb.mjs
 *
 * 将 ../knowledge/ 下的 .txt/.md 文件分段存入 Supabase
 */

import "dotenv/config";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname, basename } from "path";
import { createClient } from "@supabase/supabase-js";

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
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    console.warn(`⚠️  跳过 ${basename(filePath)}：编码错误`);
    return null;
  }
}

function splitText(text) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + CHUNK_SIZE, text.length);
    if (end < text.length) {
      for (const bp of ["\n\n", "\n", "。", "；", "，"]) {
        const idx = text.lastIndexOf(bp, end);
        if (idx > start + CHUNK_SIZE * 0.6) {
          end = idx + bp.length;
          break;
        }
      }
    }
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 10) chunks.push(chunk);
    start = end - CHUNK_OVERLAP;
  }
  return chunks;
}

async function main() {
  console.log("\n📚 知识库导入\n");

  const files = listFiles(KNOWLEDGE_DIR);
  if (files.length === 0) {
    console.log("❌ knowledge/ 目录中没有 .txt 或 .md 文件\n");
    process.exit(1);
  }

  console.log(`📄 找到 ${files.length} 个文件:\n`);
  files.forEach((f) => console.log(`   - ${f.name}`));

  // 清空旧数据
  const { count } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true });

  if (count > 0) {
    console.log(`\n🗑️  清空旧数据 (${count} 条)...`);
    await supabase
      .from("documents")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
  }

  // 逐文件导入
  let total = 0;
  for (const file of files) {
    console.log(`\n📖 ${file.name}`);

    const stat = statSync(file.path);
    if (stat.size > 10 * 1024 * 1024) {
      console.log("   ⚠️  跳过（超过 10MB）");
      continue;
    }

    const content = readText(file.path);
    if (!content) continue;

    const chunks = splitText(content);
    const rows = chunks.map((chunk, i) => ({
      content: chunk,
      metadata: { source: file.name, chunkIndex: i },
    }));

    const { error } = await supabase.from("documents").insert(rows);
    if (error) {
      console.error(`   ❌ 插入失败: ${error.message}`);
    } else {
      total += rows.length;
      console.log(`   ✅ ${rows.length} 个片段已导入`);
    }
  }

  console.log(`\n✅ 完成！共 ${total} 个片段已入库\n`);
}

main().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});
