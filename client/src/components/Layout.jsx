/**
 * Layout — 顶部工具栏 + 左侧滑出菜单 + 主工作区
 */
export default function Layout({
  children,
  sidebarOpen,
  onToggleSidebar,
  sidebarContent,
  avatarDropdown,
}) {
  return (
    <div className="app-shell flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="打开菜单"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
              MX
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">机务 AI 排故助手</p>
              <p className="hidden text-[11px] text-slate-400 sm:block">Maintenance troubleshooting trainer</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
              Training Mode
            </span>
            {avatarDropdown}
          </div>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <button
            className="fixed inset-0 z-20 bg-slate-950/30"
            onClick={onToggleSidebar}
            aria-label="关闭菜单遮罩"
          />
        )}

        <aside
          className={`fixed left-0 top-0 z-40 flex h-full w-[min(84vw,320px)] transform-gpu flex-col border-r border-slate-200 bg-white shadow-lg transition-transform duration-200 ease-out will-change-transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="shrink-0 border-b border-slate-100 px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">排故工作台</p>
                <p className="text-xs text-slate-400">记录、配置与学习状态</p>
              </div>
              <button
                onClick={onToggleSidebar}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="关闭菜单"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="sidebar-scroll flex-1 space-y-2 overflow-y-auto p-3">{sidebarContent}</div>
        </aside>

        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
