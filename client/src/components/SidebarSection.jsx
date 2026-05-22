import { useState } from "react";

/**
 * SidebarSection — 可折叠的侧边栏区域
 * 支持三层结构：Section → SubItem（可选）
 */
export default function SidebarSection({ title, icon: Icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      {/* 一级标题 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold
          text-slate-500 uppercase tracking-wide hover:bg-slate-50 transition-colors"
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span className="flex-1 text-left">{title}</span>
        <svg
          className={`w-3 h-3 text-slate-300 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 折叠内容 */}
      {open && <div>{children}</div>}
    </div>
  );
}

/**
 * SubSection — 二级折叠项（用于设置里的子菜单）
 */
export function SubSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-2 text-sm
          text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`w-3 h-3 text-slate-300 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {open && <div className="px-4">{children}</div>}
    </div>
  );
}

/**
 * InfoRow — 键值对信息行
 */
export function InfoRow({ label, value, badge }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium flex items-center gap-1.5">
        {value}
        {badge && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
      </span>
    </div>
  );
}
