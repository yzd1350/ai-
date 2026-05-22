import { useState } from "react";

/**
 * SearchBox — 首页搜索输入组件
 * 用户输入故障现象后点"开始排故"触发 onSubmit
 */
export default function SearchBox({ onSubmit, isLoading }) {
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  };

  // Ctrl+Enter 提交
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 引导区 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
          <svg
            className="w-8 h-8 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">请输入故障现象</h2>
        <p className="text-sm text-slate-500">
          描述您遇到的飞机故障表现，AI 将为您分析可能原因和排故步骤
        </p>
      </div>

      {/* 输入框 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='例如："发动机启动时 N2 转速上不去，有悬挂现象，EGT 正常上升，启动活门指示灯正常"'
          rows={4}
          className="w-full resize-none text-slate-800 placeholder-slate-400 outline-none text-base leading-relaxed"
          disabled={isLoading}
        />

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            Ctrl + Enter 快速提交
          </span>
          <button
            onClick={handleSubmit}
            disabled={!question.trim() || isLoading}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium
                       hover:bg-slate-800 active:scale-95 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                正在分析故障...
              </span>
            ) : (
              "开始排故"
            )}
          </button>
        </div>
      </div>

      {/* 示例提示 */}
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-400 mb-2">试试这些问题：</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "APU 启动后自动关车，无故障灯亮",
            "液压系统 B 油箱油量持续下降",
            "空调组件 1 无冷气输出",
          ].map((example) => (
            <button
              key={example}
              onClick={() => setQuestion(example)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-full
                         hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
