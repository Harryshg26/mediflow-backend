import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/layout/AppLayout";
import {
  GripVertical,
  Sparkles,
  Check,
  X,
  Clock,
  Package,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const pipelineStages = [
  { key: "received", label: "Received", color: "#718096", bgColor: "#F4F6F8" },
  { key: "checking", label: "Clinical Check", color: "#D69E2E", bgColor: "#FFFBEB" },
  { key: "dispensing", label: "Dispensing", color: "#005EB8", bgColor: "#DBEAFE" },
  { key: "ready", label: "Ready", color: "#1A6B4D", bgColor: "#C6F6D5" },
];

export default function QueueManagement() {
  const { data: queueData } = trpc.queue.list.useQuery();
  trpc.ai.getQueueOptimization.useQuery();
  trpc.ai.getLogs.useQuery({ limit: 5 });
  const utils = trpc.useUtils();

  const updateStatus = trpc.prescription.updateStatus.useMutation({
    onSuccess: () => {
      utils.queue.list.invalidate();
      utils.prescription.list.invalidate();
    },
  });

  const [showSuggestions, setShowSuggestions] = useState(true);

  const prescriptionsByStage = (status: string) => {
    if (!queueData) return [];
    return queueData.filter((q) => q.prescription?.status === status);
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-[1440px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2B2B2B]">Queue Management</h1>
            <p className="text-sm text-[#718096] mt-0.5">Manage prescription workflow and AI-optimized queue ordering</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                showSuggestions ? "bg-[rgba(26,107,77,0.08)] text-[#1A6B4D]" : "bg-[#F4F6F8] text-[#4A5568]"
              )}
            >
              <Sparkles className="w-4 h-4" />
              AI Suggestions
            </button>
          </div>
        </div>

        {/* Kanban Pipeline */}
        <div className="grid grid-cols-4 gap-4">
          {pipelineStages.map((stage) => {
            const items = prescriptionsByStage(stage.key);
            return (
              <div key={stage.key} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Column Header */}
                <div
                  className="px-4 py-3 border-b-2 flex items-center justify-between"
                  style={{ borderColor: stage.color, backgroundColor: stage.bgColor }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: stage.color }}>
                      {stage.label}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: stage.color }}
                    >
                      {items.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                  {items.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-md border border-[#E4E6E8] bg-white hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-[#E4E6E8] mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                              style={{
                                backgroundColor:
                                  entry.prescription?.aiPriority === "urgent"
                                    ? "#C53030"
                                    : entry.prescription?.aiPriority === "high"
                                    ? "#D69E2E"
                                    : "#005EB8",
                              }}
                            >
                              {entry.patient?.name?.charAt(0)}
                            </div>
                            <p className="text-xs font-medium text-[#2B2B2B] truncate">
                              {entry.patient?.name}
                            </p>
                          </div>
                          <p className="text-[11px] text-[#4A5568] truncate">
                            {entry.prescription?.keyDrug}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="flex items-center gap-1 text-[10px] text-[#718096]">
                              <Package className="w-3 h-3" />
                              {entry.prescription?.items} items
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-[#718096]">
                              <Clock className="w-3 h-3" />
                              <LiveTimeCounter receivedAt={entry.prescription?.receivedAt} />
                            </span>
                          </div>
                          {entry.prescription?.aiPriority === "urgent" && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertTriangle className="w-3 h-3 text-[#C53030]" />
                              <span className="text-[10px] text-[#C53030]">{entry.prescription?.aiPriorityReason}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stage Actions */}
                      <div className="flex gap-1 mt-2 pt-2 border-t border-[#F4F6F8]">
                        {stage.key !== "ready" && (
                          <button
                            onClick={() => {
                              const nextStage =
                                stage.key === "received"
                                  ? "checking"
                                  : stage.key === "checking"
                                  ? "dispensing"
                                  : "ready";
                              updateStatus.mutate({
                                id: entry.prescriptionId,
                                status: nextStage as any,
                              });
                            }}
                            className="flex-1 px-2 py-1 text-[10px] font-medium bg-[#005EB8] text-white rounded hover:bg-[#004A94] transition-colors"
                          >
                            Move → {stage.key === "received" ? "Check" : stage.key === "checking" ? "Dispense" : "Ready"}
                          </button>
                        )}
                        {stage.key === "ready" && (
                          <button
                            onClick={() => {
                              updateStatus.mutate({
                                id: entry.prescriptionId,
                                status: "collected",
                              });
                            }}
                            className="flex-1 px-2 py-1 text-[10px] font-medium bg-[#1A6B4D] text-white rounded hover:bg-[#145A3F] transition-colors"
                          >
                            Collected
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Optimization Suggestions */}
        {showSuggestions && (
          <div
            className="rounded-lg p-4 border border-[#1A6B4D]/20"
            style={{ background: "linear-gradient(135deg, rgba(26,107,77,0.08) 0%, rgba(0,94,184,0.04) 100%)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#1A6B4D]" />
              <h3 className="text-sm font-semibold text-[#2B2B2B]">AI Suggestions (3 new)</h3>
            </div>
            <div className="space-y-2">
              {[
                { text: "Move 3 discharge prescriptions to front — patients waiting in car park", confidence: 94, timeSave: 14 },
                { text: "Assign complex prescription (6 items, 3 interactions) to Senior Pharmacist Chen", confidence: 89, timeSave: 8 },
                { text: "Batch 4 amoxicillin prescriptions together — same drug, same shelf", confidence: 91, timeSave: 12 },
              ].map((suggestion, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-md p-3">
                  <div className="flex-1">
                    <p className="text-xs text-[#4A5568]">{suggestion.text}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-[#1A6B4D] font-medium">{suggestion.confidence}% confidence</span>
                      <span className="text-[10px] text-[#D69E2E]">Est. {suggestion.timeSave} min saved</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-md bg-[#1A6B4D] text-white hover:bg-[#145A3F] transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-md bg-[#E4E6E8] text-[#718096] hover:bg-[#D1D5D9] transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function LiveTimeCounter({ receivedAt }: { receivedAt?: Date | null }) {
  const [now] = useState(new Date());
  if (!receivedAt) return "—";
  const diff = Math.floor((now.getTime() - new Date(receivedAt).getTime()) / 60000);
  return `${diff}m`;
}
