import { useEffect, useMemo, useState } from "react";
import Layout from "./components/Layout";
import SearchBox from "./components/SearchBox";
import ResultCard from "./components/ResultCard";
import MenuCard from "./components/MenuCard";
import AvatarDropdown from "./components/AvatarDropdown";
import { SubSection, InfoRow } from "./components/SidebarSection";
import { useHistory } from "./hooks/useHistory";
import { getHealthStatus, queryTroubleshoot } from "./utils/api";

const ACCOUNT = {
  name: "机务工程师",
  avatarLetter: "E",
  role: "训练工作台",
  mode: "单用户 / 学习 Demo",
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
  const [health, setHealth] = useState({
    status: "checking",
    deepseekConfigured: false,
    supabaseConfigured: false,
    embeddingConfigured: false,
    embeddingProvider: "ZHIPU",
  });

  const { records, addRecord, removeRecord, clearAll } = useHistory();

  useEffect(() => {
    let alive = true;
    getHealthStatus().then((data) => {
      if (alive) setHealth(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  const account = useMemo(
    () => ({
      ...ACCOUNT,
      deepseekConfigured: health.deepseekConfigured,
      supabaseConfigured: health.supabaseConfigured,
      embeddingConfigured: health.embeddingConfigured,
      embeddingProvider: health.embeddingProvider || "ZHIPU",
      serviceOnline: health.status === "ok",
    }),
    [health]
  );

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
          <div className="px-4 py-6 text-center">
            <p className="text-xs font-medium text-slate-500">暂无排故记录</p>
            <p className="mt-1 text-[11px] text-slate-400">完成一次分析后会自动保存到这里</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-[11px] text-slate-400">最多保留 50 条</span>
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
                  <p className="text-xs font-medium text-slate-800 line-clamp-2 flex-1">{r.question}</p>
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
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-400">{r.summary}</p>
                <span className="mt-1 inline-block text-[10px] text-slate-400">{formatTime(r.createdAt)}</span>
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
            <InfoRow label="当前模式" value="单用户 / 学习 Demo" />
            <InfoRow label="用户名" value="机务工程师" />
          </SubSection>

          <SubSection title="API 配置">
            <InfoRow label="后端服务" value={health.status === "ok" ? "在线" : "未连接"} badge={health.status !== "ok"} />
            <InfoRow label="DeepSeek API" value={health.deepseekConfigured ? "已配置" : "未配置"} badge={!health.deepseekConfigured} />
            <InfoRow label="智谱 Embedding" value={health.embeddingConfigured ? "已配置" : "未配置"} badge={!health.embeddingConfigured} />
            <InfoRow label="Supabase" value={health.supabaseConfigured ? "已配置" : "未配置"} badge={!health.supabaseConfigured} />
            <p className="text-xs text-slate-400 mt-1 px-1">
              状态来自 /api/health，在 server/.env 中配置
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
      avatarDropdown={<AvatarDropdown account={account} />}
    >
      {/* 搜索页 */}
      {pageState === "search" && (
        <div className="min-h-[calc(100vh-6rem)] flex flex-col justify-center">
          <SearchBox onSubmit={handleSearch} isLoading={false} health={health} historyCount={records.length} />
          {error && (
            <div className="mx-auto mt-4 w-full max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* 加载页 */}
      {pageState === "loading" && (
        <div className="mx-auto w-full max-w-3xl pt-8 md:pt-14">
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">正在分析故障</p>
            <p className="text-slate-800 font-medium">{currentQuestion}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-500"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-700">正在检索知识库并分析可能原因...</p>
            <p className="mt-2 text-xs text-slate-400">预计需要 3~10 秒，请以 AMM / 工卡为最终依据</p>
          </div>
          <div className="space-y-3 mt-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
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
        <div className="mx-auto w-full max-w-4xl pt-4">
          <div className="mb-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">当前故障</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">训练建议</span>
              </div>
              <p className="text-base font-semibold leading-relaxed text-slate-900">{currentQuestion}</p>
            </div>
          </div>
          <ResultCard data={currentResult} onRetry={handleRetry} />
        </div>
      )}
    </Layout>
  );
}
