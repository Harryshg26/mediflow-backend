import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/layout/AppLayout";
import {
  TrendingDown,
  TrendingUp,
  Brain,
  Target,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#005EB8", "#1A6B4D", "#D69E2E", "#C53030", "#718096"];

export default function AIAnalytics() {
  const { data: waitTrends } = trpc.analytics.getWaitTimeTrends.useQuery({ days: 30 });
  trpc.analytics.getVolumeTrends.useQuery({ days: 30 });
  const { data: aiAnalytics } = trpc.ai.getAnalytics.useQuery();
  const { data: comparison } = trpc.analytics.getComparison.useQuery();
  const { data: aiLogs } = trpc.ai.getLogs.useQuery({ limit: 20 });
  const { data: recommendations } = trpc.ai.getStaffRecommendations.useQuery();

  const pieData = aiAnalytics?.byAction
    ? Object.entries(aiAnalytics.byAction).map(([key, value]) => ({
        name: key.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value,
      }))
    : [];

  return (
    <AppLayout>
      <div className="p-6 max-w-[1440px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#2B2B2B]">AI Analytics</h1>
          <p className="text-sm text-[#718096] mt-0.5">Deep analytics and AI performance dashboards</p>
        </div>

        {/* Impact Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: "Wait Time Reduction",
              value: "-34%",
              sub: "vs. pre-AI baseline",
              detail: "Average wait down from 28min to 18min",
              icon: TrendingDown,
              color: "#1A6B4D",
            },
            {
              label: "Throughput Increase",
              value: "+22%",
              sub: "Prescriptions per hour",
              detail: "From 12.5 to 15.2 per hour",
              icon: TrendingUp,
              color: "#005EB8",
            },
            {
              label: "AI Prediction Accuracy",
              value: `${aiAnalytics?.averageConfidence ?? 94}%`,
              sub: "Demand forecasts this month",
              detail: "Based on 156 predictions",
              icon: Target,
              color: "#1A6B4D",
            },
            {
              label: "Staff Time Saved",
              value: "4.2 hrs/day",
              sub: "Automated tasks",
              detail: "Queue reordering, flagging, notifications",
              icon: Clock,
              color: "#005EB8",
            },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}15` }}
                >
                  <card.icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
                <span className="text-xs text-[#718096]">{card.label}</span>
              </div>
              <p className="text-3xl font-bold text-[#2B2B2B]" style={{ color: card.color }}>
                {card.value}
              </p>
              <p className="text-xs text-[#4A5568] mt-1">{card.sub}</p>
              <p className="text-[11px] text-[#718096] mt-0.5">{card.detail}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Wait Time Trends */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-4 h-4 text-[#1A6B4D]" />
              <h3 className="text-sm font-semibold text-[#2B2B2B]">Average Wait Time — Last 30 Days</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={waitTrends ?? []}>
                <defs>
                  <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C53030" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#C53030" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A6B4D" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#1A6B4D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E6E8" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#718096" }} tickFormatter={(v) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} />
                <YAxis tick={{ fontSize: 10, fill: "#718096" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Area type="monotone" dataKey="avgWaitTime" stroke="#C53030" fill="url(#colorWait)" strokeWidth={2} name="Avg Wait (min)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* AI Task Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-[#005EB8]" />
              <h3 className="text-sm font-semibold text-[#2B2B2B]">AI Automations This Week</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ percent }: { name: string; percent: number }) => `${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[11px] text-[#4A5568]">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Before/After Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="text-sm font-semibold text-[#2B2B2B] mb-4">Pre-AI Baseline</h3>
            <div className="space-y-3">
              {[
                { label: "Average Queue Length", value: comparison?.beforeAI?.avgQueueLength ?? 38 },
                { label: "Average Wait Time", value: `${comparison?.beforeAI?.avgWaitTime ?? 28} min` },
                { label: "Peak Overflows/week", value: comparison?.beforeAI?.peakOverflows ?? 4 },
                { label: "Staff Overtime/week", value: `${comparison?.beforeAI?.staffOvertime ?? 12} hrs` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#F4F6F8]">
                  <span className="text-xs text-[#4A5568]">{item.label}</span>
                  <span className="text-sm font-semibold text-[#C53030]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="text-sm font-semibold text-[#2B2B2B] mb-4">With AI Agent</h3>
            <div className="space-y-3">
              {[
                { label: "Average Queue Length", value: comparison?.afterAI?.avgQueueLength ?? 24, improvement: comparison?.improvements?.queueLength },
                { label: "Average Wait Time", value: `${comparison?.afterAI?.avgWaitTime ?? 18} min`, improvement: comparison?.improvements?.waitTime },
                { label: "Peak Overflows/week", value: comparison?.afterAI?.peakOverflows ?? 1, improvement: comparison?.improvements?.overflows },
                { label: "Staff Overtime/week", value: `${comparison?.afterAI?.staffOvertime ?? 4} hrs`, improvement: comparison?.improvements?.overtime },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#F4F6F8]">
                  <span className="text-xs text-[#4A5568]">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1A6B4D]">{item.value}</span>
                    <span className="text-xs font-medium text-[#1A6B4D] bg-[#C6F6D5] px-1.5 py-0.5 rounded">
                      {item.improvement ?? 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div
          className="rounded-lg p-5 border border-[#1A6B4D]/20"
          style={{ background: "linear-gradient(135deg, rgba(26,107,77,0.08) 0%, rgba(0,94,184,0.04) 100%)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#1A6B4D]" />
            <h3 className="text-sm font-semibold text-[#2B2B2B]">AI-Generated Recommendations</h3>
          </div>
          <div className="space-y-3">
            {recommendations?.map((rec, i) => (
              <div key={i} className="bg-white rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#2B2B2B]">{rec.recommendation}</p>
                    <p className="text-xs text-[#4A5568] mt-1">{rec.reason}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[#1A6B4D] font-medium">{rec.confidence}% confidence</span>
                      <span className="text-xs text-[#D69E2E]">{rec.estimatedImpact}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button className="px-3 py-1.5 bg-[#1A6B4D] text-white text-xs rounded-md hover:bg-[#145A3F] transition-colors">
                      Implement
                    </button>
                    <button className="px-3 py-1.5 bg-[#E4E6E8] text-[#4A5568] text-xs rounded-md hover:bg-[#D1D5D9] transition-colors">
                      Review Later
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Logs Table */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="text-sm font-semibold text-[#2B2B2B] mb-4">Recent AI Actions</h3>
          <table className="w-full">
            <thead>
              <tr className="bg-[#F4F6F8]">
                {["Action", "Description", "Confidence", "Status", "Time Saved"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-[11px] font-medium text-[#718096] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aiLogs?.map((log) => (
                <tr key={log.id} className="border-b border-[#F4F6F8]">
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-medium text-[#2B2B2B]">
                      {log.action.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-[#4A5568] max-w-xs truncate">{log.description}</td>
                  <td className="px-4 py-2.5 text-xs font-medium text-[#1A6B4D]">{log.confidence}%</td>
                  <td className="px-4 py-2.5">
                    {log.wasAccepted === true ? (
                      <span className="flex items-center gap-1 text-xs text-[#1A6B4D]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                      </span>
                    ) : log.wasAccepted === false ? (
                      <span className="flex items-center gap-1 text-xs text-[#C53030]">
                        <XCircle className="w-3.5 h-3.5" /> Dismissed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-[#718096]">
                        <HelpCircle className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-[#4A5568]">{log.timeSaved ? `${log.timeSaved} min` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
