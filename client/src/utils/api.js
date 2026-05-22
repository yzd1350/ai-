/**
 * API 工具 — 调用后端 /api/query
 *
 * 如果后端不可达，自动降级为内嵌 mock 数据（方便前端独立开发调试）。
 */

// 内嵌 mock 数据 — 后端不可用时兜底
const MOCK_FALLBACK = {
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
        "压气机叶片表面积碳、外来物损伤或长期运行后叶尖间隙超出手册容差，导致压缩效率下降。",
    },
    {
      cause: "启动活门（SAV）开启不到位",
      probability: "中",
      detail: "启动活门未完全打开或内部蝶阀卡滞，减少了进入启动机的引气流量。",
    },
    {
      cause: "N2 转速传感器信号偏差",
      probability: "低",
      detail:
        "N2 转速传感器污染、接线松动或磁阻探头间隙异常，导致驾驶舱指示值偏低。优先通过校装检查排除。",
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
      action: "使用孔探仪检查压气机第 1~4 级叶片：查找叶尖卷边、涂层剥落、外来物打伤等异常。",
      reference: "AMM 72-00-00",
    },
    {
      step: 4,
      action: "若以上检查正常，拆下启动机进行台架性能测试，测量输出扭矩和转速曲线。",
      reference: "AMM 80-12-00",
    },
    {
      step: 5,
      action: "更换或修复故障部件后，执行湿冷转和干冷转测试，确认 N2 加速曲线恢复正常。",
      reference: "AMM 71-00-00",
    },
  ],
  ammChapters: [
    "AMM 80-11-00 启动机系统",
    "AMM 72-00-00 发动机核心机检查",
    "AMM 80-12-00 启动机拆装",
    "AMM 71-00-00 动力装置试车",
  ],
  toolsAndMaterials: {
    tools: ["数字压力表（量程 0-100 psi）", "孔探仪", "力矩扳手", "N2 转速传感器校装工具"],
    materials: ["启动机润滑油 MIL-PRF-23699", "密封圈 P/N: 12345-678", "防腐剂 MIL-PRF-81309"],
    notes:
      "注意：发动机停车后至少等待 30 分钟降至安全温度再开始检查。启动机拆装前务必断开气源并确认管路已释压。",
  },
};

/**
 * 调用后端 API 获取排故建议
 * 后端不可用时自动降级为本地 mock 数据
 *
 * @param {string} question - 用户输入的故障现象
 * @returns {Promise<object>} { success, data, meta? }
 */
export async function queryTroubleshoot(question) {
  try {
    // 尝试调用真实后端
    const res = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const json = await res.json();
    return json; // { success: true, data: {...} } 或 { success: false, error: "..." }
  } catch (err) {
    // 后端不可达 → 降级为 mock 数据
    console.warn("[api] 后端不可达，使用本地 mock 数据：", err.message);

    // 模拟网络延迟
    await new Promise((r) => setTimeout(r, 1500));

    return {
      success: true,
      data: MOCK_FALLBACK,
      meta: { mock: true },
    };
  }
}
