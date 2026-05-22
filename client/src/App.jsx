import { useState } from "react";
import Layout from "./components/Layout";
import SearchBox from "./components/SearchBox";
import ResultCard from "./components/ResultCard";
import MenuCard from "./components/MenuCard";
import AvatarDropdown from "./components/AvatarDropdown";
import { SubSection, InfoRow } from "./components/SidebarSection";
import { useHistory } from "./hooks/useHistory";
import { queryTroubleshoot } from "./utils/api";

const ACCOUNT = {
  name: "机务工程师",
  avatarLetter: "E",
  role: "单用户模式",
  mode: "离线 Demo",
  deepseekConfigured: false,
  openaiConfigured: false,
  supabaseConfigured: false,
};

/** 历史图标 */
function HistoryIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/** 设置图标 */
function GearIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function App() {
  const [pageState, setPageState] = useState("search");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentResult, setCurrentResult] = useState(null);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { records, addRecord, removeRecord, clearAll } = useHistory();

  const handleSearch = async (question) => {
    setCurrentQuestion(question);
    setError("");
    setPageState("loading");
    try {
      const res = await queryTroubleshoot(question);
      if (res.success) {
        setCurrentResult(res.data);
        addRecord(question, res.data.summary);
        setPageState("result");
      } else {
        setError(res.error || "未知错误");
        setPageState("search");
      }
    } catch {
      setError("连接失败，Demo 模式可忽略。");
      setPageState("search");
    }
  };

  const handleSelectHistory = async (record) => {
    setSidebarOpen(false);
    setCurrentQuestion(record.question);
    setError("");
    setPageState("loading");
    try {
      const res = await queryTroubleshoot(record.question);
      if (res.success) {
        setCurrentResult(res.data);
        setPageState("result");
      }
    } catch {
      setPageState("search");
    }
  };

  const handleRetry = () => {
    setCurrentQuestion("");
    setCurrentResult(null);
    setPageState("search");
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60 * 1000) return "刚刚";
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} 小时前`;
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  };

  // 侧边栏菜单内容
  const sidebarContent = (
    <>
      {/* 卡片1：历史记录 */}
      <MenuCard
        icon={HistoryIcon}
        title="历史记录"
        badge={records.length > 0 ? `${records.length}` : null}
        open={historyOpen}
        onToggle={() => setHistoryOpen((v) => !v)}
      >
        {records.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 px-4">
            暂无记录，输入故障开始排故
          </p>
        ) : (
          <div>
            <div className="px-4 py-2">
              <button
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                清空全部
              </button>
            </div>
            {records.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelectHistory(r)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50
                  border-t border-slate-50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="text-xs text-slate-800 truncate flex-1">{r.question}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeRecord(r.id); }}
                    className="text-slate-300 hover:text-red-400 opacity-0
                      group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <span className="text-[10px] text-slate-400">{formatTime(r.createdAt)}</span>
              </button>
            ))}
          </div>
        )}
      </MenuCard>

      {/* 卡片2：设置 */}
      <MenuCard
        icon={GearIcon}
        title="设置"
        open={settingsOpen}
        onToggle={() => setSettingsOpen((v) => !v)}
      >
        <div className="px-4 py-3 space-y-1">
          <SubSection title="账户信息">
            <InfoRow label="当前模式" value="单用户 / 离线 Demo" />
            <InfoRow label="用户名" value="机务工程师" />
          </SubSection>

          <SubSection title="API 配置">
            <InfoRow label="DeepSeek API" value="未配置" badge />
            <InfoRow label="OpenAI API" value="未配置" badge />
            <InfoRow label="Supabase" value="未配置" badge />
            <p className="text-xs text-slate-400 mt-1 px-1">
              在 server/.env 中配置
            </p>
          </SubSection>

          <SubSection title="关于">
            <InfoRow label="版本" value="v0.1.0 Demo" />
            <InfoRow label="技术栈" value="React + Express + DeepSeek" />
          </SubSection>
        </div>
      </MenuCard>
    </>
  );

  return (
    <Layout
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => {
        const willClose = sidebarOpen;
        setSidebarOpen((v) => !v);
        if (willClose) {
          setHistoryOpen(false);
          setSettingsOpen(false);
        }
      }}
      sidebarContent={sidebarContent}
      avatarDropdown={<AvatarDropdown account={ACCOUNT} />}
    >
      {/* 搜索页 */}
      {pageState === "search" && (
        <div className="min-h-[80vh] flex flex-col justify-center">
          <SearchBox onSubmit={handleSearch} isLoading={false} />
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* 加载页 */}
      {pageState === "loading" && (
        <div className="pt-10 md:pt-16">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
            <p className="text-xs text-slate-400 mb-1">正在分析故障</p>
            <p className="text-slate-800 font-medium">{currentQuestion}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
            <p className="text-slate-500 text-sm">正在检索知识库并分析可能原因...</p>
            <p className="text-slate-400 text-xs mt-2">预计需要 3~10 秒</p>
          </div>
          <div className="space-y-3 mt-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="h-4 bg-slate-100 rounded w-24 mb-3" />
                <div className="h-3 bg-slate-50 rounded w-full mb-2" />
                <div className="h-3 bg-slate-50 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 结果页 */}
      {pageState === "result" && currentResult && (
        <div className="pt-4">
          <div className="mb-4">
            <div className="bg-slate-900 text-white rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">故障现象</p>
              <p className="font-medium">{currentQuestion}</p>
            </div>
          </div>
          <ResultCard data={currentResult} onRetry={handleRetry} />
        </div>
      )}
    </Layout>
  );
}
