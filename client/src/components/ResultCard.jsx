import { useState } from "react";

const SECTION_META = {
  causes: { index: "01", title: "可能原因", caption: "按概率和排查优先级阅读" },
  steps: { index: "02", title: "处理步骤", caption: "按训练流程逐项确认" },
  amm: { index: "03", title: "AMM 章节", caption: "定位手册章节与工卡依据" },
  tools: { index: "04", title: "工具 / 航材 / 注意事项", caption: "执行前准备与风险提示" },
};

/**
 * ResultCard — 排故报告工作流
 */
export default function ResultCard({ data, onRetry, onCopy }) {
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    causes: true,
    steps: true,
    amm: true,
    tools: true,
  });

  const causes = data.possibleCauses || [];
  const steps = data.steps || [];
  const chapters = data.ammChapters || [];
  const materials = data.toolsAndMaterials || { tools: [], materials: [], notes: "" };

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const buildPlainText = () => {
    let text = "【机务 AI 排故报告】\n\n";
    text += `故障概述：${data.summary || "暂无"}\n\n`;
    text += "═══ 可能原因 ═══\n";
    causes.forEach((c, i) => {
      text += `${i + 1}. [${c.probability || "未标注"}] ${c.cause || "未命名原因"}\n   ${c.detail || ""}\n\n`;
    });
    text += "═══ 处理步骤 ═══\n";
    steps.forEach((s, i) => {
      text += `${s.step || i + 1}. ${s.action || ""}\n   参考：${s.reference || "未标注"}\n\n`;
    });
    text += "═══ 涉及 AMM 章节 ═══\n";
    chapters.forEach((ch) => {
      text += `• ${ch}\n`;
    });
    text += "\n═══ 工具/航材/注意事项 ═══\n";
    text += "【所需工具】\n";
    (materials.tools || []).forEach((t) => (text += `• ${t}\n`));
    text += "\n【所需航材】\n";
    (materials.materials || []).forEach((m) => (text += `• ${m}\n`));
    text += `\n【注意事项】\n${materials.notes || "无"}\n`;
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildPlainText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    if (onCopy) onCopy();
  };

  return (
    <div className="mx-auto space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">排故摘要</span>
          <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">训练输出</span>
        </div>
        <p className="text-base leading-7 text-slate-800">{data.summary}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          <SectionCard
            meta={SECTION_META.causes}
            badge={`${causes.length} 项`}
            expanded={expandedSections.causes}
            onToggle={() => toggleSection("causes")}
          >
            <div className="space-y-3">
              {causes.map((item, i) => (
                <div key={`${item.cause}-${i}`} className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <p className="text-sm font-semibold leading-6 text-slate-900">
                      {i + 1}. {item.cause}
                    </p>
                    <span className={`w-fit shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${probabilityColor(item.probability)}`}>
                      概率 {item.probability || "未标注"}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            meta={SECTION_META.steps}
            badge={`${steps.length} 步`}
            expanded={expandedSections.steps}
            onToggle={() => toggleSection("steps")}
          >
            <div className="space-y-3">
              {steps.map((s, i) => (
                <div key={`${s.step}-${i}`} className="grid grid-cols-[32px_1fr] gap-3 rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                    {s.step || i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm leading-6 text-slate-800">{s.action}</p>
                    <p className="mt-1 text-xs font-semibold text-amber-700">参考：{s.reference || "未标注"}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            meta={SECTION_META.amm}
            badge={`${chapters.length} 章`}
            expanded={expandedSections.amm}
            onToggle={() => toggleSection("amm")}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {chapters.map((ch, i) => (
                <div key={`${ch}-${i}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium leading-6 text-slate-700">
                  {ch}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-4">
          <SectionCard
            meta={SECTION_META.tools}
            badge="清单"
            expanded={expandedSections.tools}
            onToggle={() => toggleSection("tools")}
          >
            <Inventory title="所需工具" items={materials.tools || []} />
            <Inventory title="所需航材" items={materials.materials || []} />
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-900">注意事项</p>
              <p className="mt-1 text-sm leading-6 text-amber-800">{materials.notes}</p>
            </div>
          </SectionCard>

          <div className="rounded-lg border border-slate-200 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-400">报告操作</p>
            <div className="mt-3 grid gap-2">
              <button
                onClick={handleCopy}
                className={`min-h-10 rounded-lg px-4 py-2 text-sm font-semibold transition active:scale-[0.99] ${
                  copied ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {copied ? "已复制" : "复制全部"}
              </button>
              <button
                onClick={onRetry}
                className="min-h-10 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99]"
              >
                重新提问
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionCard({ meta, badge, expanded, onToggle, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-slate-50"
      >
        <div className="flex min-w-0 items-start gap-3">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">{meta.index}</span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">{meta.title}</h3>
            <p className="mt-0.5 text-xs leading-5 text-slate-400">{meta.caption}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">{badge}</span>
          <svg className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && <div className="border-t border-slate-100 p-4">{children}</div>}
    </section>
  );
}

function Inventory({ title, items }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-semibold text-slate-500">{title}</p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={`${item}-${i}`} className="flex gap-2 text-sm leading-6 text-slate-700">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function probabilityColor(p) {
  switch (p) {
    case "高":
      return "bg-red-50 text-red-700 border border-red-100";
    case "中":
      return "bg-amber-50 text-amber-700 border border-amber-100";
    case "低":
      return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    default:
      return "bg-slate-100 text-slate-600";
  }
}
