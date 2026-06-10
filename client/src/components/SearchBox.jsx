import { useMemo, useState } from "react";

const EXAMPLES = [
  "APU 启动后自动关车，无故障灯亮",
  "液压系统 B 油箱油量持续下降",
  "空调组件 1 无冷气输出",
];

function StatusPill({ label, ok, pending }) {
  const tone = pending ? "bg-slate-100 text-slate-500" : ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${pending ? "bg-slate-300" : ok ? "bg-emerald-500" : "bg-amber-500"}`} />
      {label}
    </span>
  );
}

/**
 * SearchBox — 首页排故输入工作台
 */
export default function SearchBox({ onSubmit, isLoading, health, historyCount = 0 }) {
  const [question, setQuestion] = useState("");
  const count = question.trim().length;
  const pending = health?.status === "checking";

  const readiness = useMemo(
    () => [
      { label: "后端", ok: health?.status === "ok" },
      { label: "DeepSeek", ok: health?.deepseekConfigured },
      { label: "知识库", ok: health?.supabaseConfigured },
      { label: "智谱向量", ok: health?.embeddingConfigured },
    ],
    [health]
  );

  const handleSubmit = () => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "Enter") handleSubmit();
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[1fr_320px]">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            AI Troubleshooting
          </span>
          <span className="rounded-md bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
            训练建议，最终以 AMM / 工卡为准
          </span>
        </div>

        <div className="mb-5">
          <h1 className="text-2xl font-semibold tracking-normal text-slate-950 md:text-3xl">
            机务 AI 排故工作台
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            输入故障现象、驾驶舱提示、系统状态或已完成检查项，生成结构化排故思路。
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='例如："发动机启动时 N2 转速上不去，有悬挂现象，EGT 正常上升，启动活门指示灯正常"'
            rows={6}
            className="min-h-36 w-full resize-none bg-transparent text-base leading-7 text-slate-900 outline-none placeholder:text-slate-400"
            disabled={isLoading}
          />

          <div className="mt-3 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Ctrl + Enter 提交</span>
              <span className={count > 1800 ? "text-amber-700" : ""}>{count}/2000</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!question.trim() || isLoading}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading && (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isLoading ? "正在分析" : "开始排故"}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-400">试试这些训练场景</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => setQuestion(example)}
                disabled={isLoading}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="maintenance-visual mb-4 h-36 overflow-hidden rounded-lg border border-slate-200">
          <div className="maintenance-visual__overlay">
            <span>Line Maintenance</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">系统状态</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {readiness.map((item) => (
                <StatusPill key={item.label} label={item.label} ok={item.ok} pending={pending} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-2xl font-semibold text-slate-950">{historyCount}</p>
              <p className="text-xs text-slate-400">历史记录</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-2xl font-semibold text-slate-950">3</p>
              <p className="text-xs text-slate-400">检索片段</p>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-900">训练提醒</p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              AI 输出用于建立排故路径，实际维修必须结合机型手册、工卡和放行要求。
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
