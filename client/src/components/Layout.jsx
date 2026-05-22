/**
 * Layout — 整体布局
 * 顶部标题栏（左:菜单按钮 / 右:头像） + 左侧滑出菜单
 */
export default function Layout({
  children,
  sidebarOpen,
  onToggleSidebar,
  sidebarContent,
  avatarDropdown,
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ======== 顶部标题栏 ======== */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center shrink-0 relative z-30">
        {/* 左侧：菜单按钮 */}
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-lg
            hover:bg-slate-100 active:scale-90 transition-all"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* 中间：Logo + 标题 */}
        <div className="flex items-center gap-2 ml-3">
          <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center text-xs font-bold text-slate-900">
            AI
          </div>
          <span className="text-sm font-semibold text-slate-800 hidden sm:block">
            机务AI排故助手
          </span>
        </div>

        {/* 右侧：头像 */}
        <div className="ml-auto">{avatarDropdown}</div>
      </header>

      {/* ======== 主体区域 ======== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 遮罩层 */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20"
            onClick={onToggleSidebar}
          />
        )}

        {/* 左侧滑出菜单 */}
        <aside
          className={`fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-xl
            flex flex-col transition-transform duration-300 ease-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* 菜单头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center text-xs font-bold text-slate-900">
                AI
              </div>
              <span className="text-sm font-semibold text-slate-800">菜单</span>
            </div>
            <button
              onClick={onToggleSidebar}
              className="w-6 h-6 flex items-center justify-center rounded
                text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 菜单内容 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sidebarContent}
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center">
          <div className="w-full max-w-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
