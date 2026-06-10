/**
 * MenuCard — 侧边栏中的可展开卡片
 * open / onToggle 由父组件控制，避免内部状态丢失
 */
export default function MenuCard({ icon: Icon, title, badge, open, onToggle, children }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50
          transition-colors cursor-pointer select-none active:bg-slate-100"
      >
        {Icon && <Icon className="w-5 h-5 text-slate-500 shrink-0" />}
        <span className="text-sm font-medium text-slate-800 flex-1 text-left">
          {title}
        </span>
        {badge && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
            {badge}
          </span>
        )}
        <svg
          className={`w-4 h-4 text-slate-300 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && <div className="border-t border-slate-100">{children}</div>}
    </div>
  );
}
