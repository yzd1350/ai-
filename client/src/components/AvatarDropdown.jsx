import { useState, useRef, useEffect } from "react";

/**
 * AvatarDropdown — 右上角头像下拉菜单
 * 点击头像显示账户信息
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
        className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center
          text-sm font-medium hover:ring-2 hover:ring-amber-400 transition-all active:scale-95"
      >
        {account.avatarLetter || "U"}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-lg
          border border-slate-200 overflow-hidden z-50">
          {/* 用户信息头部 */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-medium">
                {account.avatarLetter || "U"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{account.name || "机务工程师"}</p>
                <p className="text-xs text-slate-400">{account.role || "单用户模式"}</p>
              </div>
            </div>
          </div>

          {/* 详细信息 */}
          <div className="px-4 py-3 space-y-2">
            <InfoRow label="账户模式" value={account.mode || "离线 Demo"} />
            <InfoRow label="DeepSeek API" value={account.deepseekConfigured ? "已配置" : "未配置"} badge={!account.deepseekConfigured} />
            <InfoRow label="OpenAI API" value={account.openaiConfigured ? "已配置" : "未配置"} badge={!account.openaiConfigured} />
            <InfoRow label="Supabase" value={account.supabaseConfigured ? "已配置" : "未配置"} badge={!account.supabaseConfigured} />
          </div>

          <div className="border-t border-slate-100 px-4 py-2">
            <p className="text-xs text-slate-400">版本 v0.1.0 Demo</p>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, badge }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium flex items-center gap-1.5">
        {value}
        {badge && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
      </span>
    </div>
  );
}
