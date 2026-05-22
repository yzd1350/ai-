import { useState } from "react";

/**
 * ResultCard — 排故结果展示卡片
 * 结构化展示：可能原因 / 处理步骤 / AMM 章节 / 工具航材
 */
export default function ResultCard({ data, onRetry, onCopy }) {
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    causes: true,
    steps: true,
    amm: true,
    tools: true,
  });

  // 折叠/展开切换
  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 生成纯文本用于复制
  const buildPlainText = () => {
    let text = "【机务AI排故报告】\n\n";
    text += `故障概述：${data.summary}\n\n`;
    text += "═══ 可能原因 ═══\n";
    data.possibleCauses.forEach((c, i) => {
      text += `${i + 1}. [${c.probability}] ${c.cause}\n   ${c.detail}\n\n`;
    });
    text += "═══ 处理步骤 ═══\n";
    data.steps.forEach((s) => {
      text += `${s.step}. ${s.action}\n   参考：${s.reference}\n\n`;
    });
    text += "═══ 涉及 AMM 章节 ═══\n";
    data.ammChapters.forEach((ch) => {
      text += `• ${ch}\n`;
    });
    text += "\n═══ 工具/航材/注意事项 ═══\n";
    text += "【所需工具】\n";
    data.toolsAndMaterials.tools.forEach((t) => (text += `• ${t}\n`));
    text += "\n【所需航材】\n";
    data.toolsAndMaterials.materials.forEach((m) => (text += `• ${m}\n`));
    text += `\n【注意事项】\n${data.toolsAndMaterials.notes}\n`;
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildPlainText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    if (onCopy) onCopy();
  };

  // 概率颜色映射
  const probabilityColor = (p) => {
    switch (p) {
      case "高":
        return "bg-red-100 text-red-700";
      case "中":
        return "bg-amber-100 text-amber-700";
      case "低":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* 故障概述 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">故障概述</h3>
        <p className="text-slate-800 leading-relaxed">{data.summary}</p>
      </div>

      {/* 可能原因 */}
      <SectionCard
        title="可能原因"
        badge={`${data.possibleCauses.length} 项`}
        expanded={expandedSections.causes}
        onToggle={() => toggleSection("causes")}
      >
        <div className="space-y-3">
          {data.possibleCauses.map((item, i) => (
            <div key={i} className="border border-slate-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-slate-800">
                  {i + 1}. {item.cause}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${probabilityColor(item.probability)}`}
                >
                  概率 {item.probability}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 处理步骤 */}
      <SectionCard
        title="处理步骤"
        badge={`${data.steps.length} 步`}
        expanded={expandedSections.steps}
        onToggle={() => toggleSection("steps")}
      >
        <div className="space-y-3">
          {data.steps.map((s) => (
            <div
              key={s.step}
              className="flex gap-3 border border-slate-100 rounded-lg p-4"
            >
              <div className="w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {s.step}
              </div>
              <div>
                <p className="text-sm text-slate-800 leading-relaxed">
                  {s.action}
                </p>
                <p className="text-xs text-amber-600 mt-1 font-medium">
                  参考：{s.reference}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* AMM 章节 */}
      <SectionCard
        title="涉及 AMM 章节"
        badge={`${data.ammChapters.length} 章`}
        expanded={expandedSections.amm}
        onToggle={() => toggleSection("amm")}
      >
        <ul className="space-y-2">
          {data.ammChapters.map((ch, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
              {ch}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* 工具/航材/注意事项 */}
      <SectionCard
        title="工具 / 航材 / 注意事项"
        badge="清单"
        expanded={expandedSections.tools}
        onToggle={() => toggleSection("tools")}
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              所需工具
            </h4>
            <ul className="space-y-1">
              {data.toolsAndMaterials.tools.map((t, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-600 flex items-center gap-2"
                >
                  <span className="text-slate-400">&#x2022;</span> {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              所需航材
            </h4>
            <ul className="space-y-1">
              {data.toolsAndMaterials.materials.map((m, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-600 flex items-center gap-2"
                >
                  <span className="text-slate-400">&#x2022;</span> {m}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-amber-800 mb-1">
              注意事项
            </h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              {data.toolsAndMaterials.notes}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* 底部操作栏 */}
      <div className="flex gap-3 justify-center pt-2 pb-6">
        <button
          onClick={handleCopy}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition-all active:scale-95
            ${copied ? "bg-green-500 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"}`}
        >
          {copied ? "已复制" : "复制全部"}
        </button>
        <button
          onClick={onRetry}
          className="px-5 py-2 bg-slate-900 text-white rounded-lg font-medium text-sm
                     hover:bg-slate-800 active:scale-95 transition-all"
        >
          重新提问
        </button>
      </div>
    </div>
  );
}

/**
 * SectionCard — 可折叠的区块卡片
 */
function SectionCard({ title, badge, expanded, onToggle, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4
          hover:bg-slate-50 active:bg-slate-100 transition-colors
          cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
            {badge}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform shrink-0 pointer-events-none ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {expanded && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}
