/**
 * LLM 调用服务 — 调用 DeepSeek API 生成排故建议
 *
 * DeepSeek 兼容 OpenAI SDK 格式，直接使用 openai 官方 npm 包。
 *
 * 容错策略：
 *   1. 优先解析模型返回的 JSON
 *   2. JSON 解析失败时，尝试提取 JSON 代码块
 *   3. 完全失败时，返回原文作为 summary
 */

import OpenAI from "openai";

// 惰性初始化客户端
let client = null;
function getClient() {
  if (client) return client;

  client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || "sk-placeholder",
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
  });

  return client;
}

/**
 * 调用 DeepSeek 生成排故建议
 * @param {Array<{role: string, content: string}>} messages - 对话消息
 * @returns {Promise<object>} 解析后的结构化排故数据
 */
export async function askDeepSeek(messages) {
  const ai = getClient();

  // 检查 API Key 是否配置
  if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === "sk-placeholder") {
    console.log("[llm] DeepSeek API Key 未配置，返回 mock 数据");
    return getMockResult();
  }

  try {
    const response = await ai.chat.completions.create(
      {
        model: "deepseek-chat",
        messages,
        temperature: 0.3, // 低温度 → 更确定性的回答
        max_tokens: 4096,
      },
      { timeout: 30000 } // 30 秒超时
    );

    const rawContent = response.choices[0]?.message?.content || "";

    // 尝试解析 JSON
    return parseResponse(rawContent);
  } catch (error) {
    console.error("[llm] DeepSeek 调用失败：", error.message);

    // 区分错误类型
    if (error.message.includes("timeout") || error.message.includes("timed out")) {
      throw new Error("AI_TIMEOUT");
    }
    if (error.status === 401 || error.status === 403) {
      throw new Error("AUTH_FAILED");
    }
    throw error;
  }
}

/**
 * 解析模型返回的内容，提取 JSON
 */
function parseResponse(rawContent) {
  // 尝试 1：直接解析整个返回内容
  try {
    return JSON.parse(rawContent);
  } catch {
    // 不是纯 JSON，继续尝试
  }

  // 尝试 2：提取 ```json ... ``` 代码块
  const jsonBlock = rawContent.match(/```json\s*([\s\S]*?)```/);
  if (jsonBlock) {
    try {
      return JSON.parse(jsonBlock[1].trim());
    } catch {
      // 代码块内的也不是合法 JSON
    }
  }

  // 尝试 3：提取 { ... } 最外层对象
  const braceMatch = rawContent.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch {
      // 最后兜底
    }
  }

  // 兜底：返回原文作为 summary
  console.warn("[llm] 无法解析 AI 返回的 JSON，使用原文兜底");
  return {
    summary: rawContent.slice(0, 500),
    possibleCauses: [],
    steps: [],
    ammChapters: [],
    toolsAndMaterials: { tools: [], materials: [], notes: "AI 返回格式异常，请重新提问" },
  };
}

/**
 * Mock 数据 — DeepSeek API Key 未配置时使用
 */
function getMockResult() {
  return {
    summary:
      "该故障表现为发动机启动过程中 N2 转子转速无法达到正常自维持转速，且伴随转速波动（悬挂现象），但 EGT 正常上升，表明燃油供给和点火系统工作正常，问题集中在启动机或压气机气动性能方面。",
    possibleCauses: [
      {
        cause: "启动机输出扭矩不足",
        probability: "高",
        detail:
          "启动机内部涡轮叶片磨损、轴承卡滞或供气管路压力低于标称值，导致无法提供足够扭矩带动 N2 转子加速至自维持转速。",
      },
      {
        cause: "压气机叶片污染或叶尖间隙过大",
        probability: "中",
        detail:
          "压气机叶片表面积碳、外来物损伤或长期运行后叶尖间隙超出手册容差，导致压缩效率下降，转子加速阻力增大。",
      },
    ],
    steps: [
      {
        step: 1,
        action: "确认故障现象：记录 N2 悬挂转速值、EGT 峰值、环境温度，拍照留存驾驶舱显示。",
        reference: "AMM 80-00-00",
      },
      {
        step: 2,
        action: "检查启动机供气管路压力：在 APU 引气条件下测量启动机入口压力，与 AMM 标称值对比。",
        reference: "AMM 80-11-00",
      },
      {
        step: 3,
        action: "使用孔探仪检查压气机第 1~4 级叶片。",
        reference: "AMM 72-00-00",
      },
    ],
    ammChapters: [
      "AMM 80-11-00 启动机系统",
      "AMM 72-00-00 发动机核心机检查",
    ],
    toolsAndMaterials: {
      tools: ["数字压力表（量程 0-100 psi）", "孔探仪", "力矩扳手"],
      materials: ["启动机润滑油 MIL-PRF-23699", "密封圈 P/N: 12345-678"],
      notes:
        "发动机停车后至少等待 30 分钟降至安全温度再开始检查。启动机拆装前务必断开气源并确认管路已释压。",
    },
  };
}
