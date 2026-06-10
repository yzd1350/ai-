import { useEffect, useRef, useState } from "react";

/**
 * AvatarDropdown — 右上角状态菜单
 */
export default function AvatarDropdown({ account }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white transition hover:ring-2 hover:ring-amber-300 active:scale-95"
        aria-label="打开账户状态"
      >
        {account.avatarLetter || "U"}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
                {account.avatarLetter || "U"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{account.name || "机务工程师"}</p>
                <p className="text-xs text-slate-400">{account.role || "训练工作台"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 px-4 py-3">
            <InfoRow label="账户模式" value={account.mode || "单用户 / 学习 Demo"} />
            <InfoRow label="后端服务" value={account.serviceOnline ? "在线" : "未连接"} warn={!account.serviceOnline} />
            <InfoRow label="DeepSeek API" value={account.deepseekConfigured ? "已配置" : "未配置"} warn={!account.deepseekConfigured} />
            <InfoRow label="智谱 Embedding" value={account.embeddingConfigured ? "已配置" : "未配置"} warn={!account.embeddingConfigured} />
            <InfoRow label="Supabase" value={account.supabaseConfigured ? "已配置" : "未配置"} warn={!account.supabaseConfigured} />
          </div>

          <div className="border-t border-slate-100 px-4 py-2">
            <p className="text-xs text-slate-400">版本 v0.1.0 Demo</p>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, warn }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="flex items-center gap-1.5 font-medium text-slate-700">
        {value}
        <span className={`h-1.5 w-1.5 rounded-full ${warn ? "bg-amber-400" : "bg-emerald-500"}`} />
      </span>
    </div>
  );
}
