import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/layout/AppLayout";
import {
  Building2,
  Brain,
  Bell,
  Link2,
  Users,
  Shield,
  Save,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "general", label: "General", icon: Building2 },
  { key: "ai", label: "AI Agent", icon: Brain },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "integrations", label: "Integrations", icon: Link2 },
];

export default function Settings() {
  const { data: settings } = trpc.settings.get.useQuery();
  const utils = trpc.useUtils();
  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: () => utils.settings.get.invalidate(),
  });
  void updateSettings;

  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2B2B2B]">Settings</h1>
          <p className="text-sm text-[#718096] mt-0.5">System configuration and AI agent tuning</p>
        </div>

        <div className="flex gap-6">
          {/* Settings Tabs */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left",
                    activeTab === tab.key
                      ? "bg-[rgba(0,94,184,0.08)] text-[#005EB8] border-r-[3px] border-r-[#005EB8]"
                      : "text-[#4A5568] hover:bg-[rgba(0,0,0,0.02)]"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#2B2B2B]">General Settings</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Hospital Name</label>
                    <input
                      type="text"
                      defaultValue={settings?.hospitalName || "St Thomas' Hospital"}
                      className="w-full px-3 py-2 bg-[#F4F6F8] rounded-md border-0 text-sm focus:ring-2 focus:ring-[#005EB8]/25"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Pharmacy Department</label>
                    <input
                      type="text"
                      defaultValue={settings?.pharmacyName || "Outpatient Pharmacy"}
                      className="w-full px-3 py-2 bg-[#F4F6F8] rounded-md border-0 text-sm focus:ring-2 focus:ring-[#005EB8]/25"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A5568] mb-1.5">
                    Target Wait Time: {settings?.targetWaitTime || 15} minutes
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    defaultValue={settings?.targetWaitTime || 15}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-[#718096]">
                    <span>5 min</span>
                    <span>60 min</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Amber Warning Threshold (min)</label>
                    <input
                      type="number"
                      defaultValue={settings?.amberThreshold || 30}
                      className="w-full px-3 py-2 bg-[#F4F6F8] rounded-md border-0 text-sm focus:ring-2 focus:ring-[#005EB8]/25"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Red Alert Threshold (min)</label>
                    <input
                      type="number"
                      defaultValue={settings?.redThreshold || 45}
                      className="w-full px-3 py-2 bg-[#F4F6F8] rounded-md border-0 text-sm focus:ring-2 focus:ring-[#005EB8]/25"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Operating Hours Start</label>
                    <input
                      type="time"
                      defaultValue={settings?.operatingHoursStart || "08:00"}
                      className="w-full px-3 py-2 bg-[#F4F6F8] rounded-md border-0 text-sm focus:ring-2 focus:ring-[#005EB8]/25"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Operating Hours End</label>
                    <input
                      type="time"
                      defaultValue={settings?.operatingHoursEnd || "20:00"}
                      className="w-full px-3 py-2 bg-[#F4F6F8] rounded-md border-0 text-sm focus:ring-2 focus:ring-[#005EB8]/25"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#2B2B2B]">AI Agent Configuration</h3>

                {/* AI Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#F4F6F8] rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-[#2B2B2B]">AI Agent</p>
                    <p className="text-xs text-[#718096]">Enable or disable the AI optimization agent</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={settings?.aiAgentEnabled ?? true} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-[#005EB8]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A6B4D]" />
                  </label>
                </div>

                {/* Optimization Level */}
                <div>
                  <label className="block text-xs font-medium text-[#4A5568] mb-2">Optimization Aggressiveness</label>
                  <div className="flex gap-2">
                    {["conservative", "balanced", "aggressive"].map((level) => (
                      <button
                        key={level}
                        className={cn(
                          "flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
                          (settings?.aiOptimizationLevel || "balanced") === level
                            ? "bg-[#005EB8] text-white"
                            : "bg-[#F4F6F8] text-[#4A5568] hover:bg-[#E4E6E8]"
                        )}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="space-y-3">
                  {[
                    { key: "autoQueueReorder", label: "Auto-reorder Queue", desc: "Automatically optimize queue ordering based on priority" },
                    { key: "autoStaffSuggestions", label: "Auto-staff Suggestions", desc: "Recommend staffing adjustments based on predicted demand" },
                    { key: "autoPatientNotifications", label: "Auto-patient Notifications", desc: "Send SMS/email when prescriptions are ready" },
                  ].map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between p-3 border border-[#E4E6E8] rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#2B2B2B]">{feature.label}</p>
                        <p className="text-xs text-[#718096]">{feature.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-[#005EB8]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A6B4D]" />
                      </label>
                    </div>
                  ))}
                </div>

                {/* Notification Threshold */}
                <div>
                  <label className="block text-xs font-medium text-[#4A5568] mb-1.5">
                    Notification Threshold: {settings?.notificationThreshold || 30} minutes
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    defaultValue={settings?.notificationThreshold || 30}
                    className="w-full"
                  />
                </div>

                {/* Retrain */}
                <div className="pt-4 border-t border-[#E4E6E8]">
                  <button className="px-4 py-2.5 bg-[#005EB8] text-white rounded-md text-sm font-medium hover:bg-[#004A94] transition-colors">
                    Retrain AI Model
                  </button>
                  <p className="text-xs text-[#718096] mt-2">Last trained: 2 hours ago</p>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#2B2B2B]">Notification Settings</h3>

                {[
                  { label: "SMS Notifications", desc: "Send SMS alerts to patients when prescriptions are ready" },
                  { label: "Email Alerts", desc: "Send email notifications for critical stock alerts" },
                  { label: "In-app Alerts", desc: "Show real-time alerts in the dashboard" },
                  { label: "Slack Integration", desc: "Send alerts to Slack channel" },
                  { label: "Teams Integration", desc: "Send alerts to Microsoft Teams" },
                ].map((notif) => (
                  <div key={notif.label} className="flex items-center justify-between p-3 border border-[#E4E6E8] rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-[#2B2B2B]">{notif.label}</p>
                      <p className="text-xs text-[#718096]">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-[#005EB8]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A6B4D]" />
                    </label>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#2B2B2B]">System Integrations</h3>

                {[
                  { name: "E-Prescribing System", status: "connected", lastSync: "2 min ago", icon: Brain },
                  { name: "Patient Admin System (PAS)", status: "connected", lastSync: "5 min ago", icon: Users },
                  { name: "Stock Management", status: "connected", lastSync: "1 min ago", icon: Building2 },
                  { name: "NHS Spine", status: "connected", lastSync: "10 min ago", icon: Shield },
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 border border-[#E4E6E8] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-[#F4F6F8] flex items-center justify-center">
                        <integration.icon className="w-5 h-5 text-[#005EB8]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#2B2B2B]">{integration.name}</p>
                        <p className="text-xs text-[#718096]">Last sync: {integration.lastSync}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {integration.status}
                      </span>
                      <button className="text-xs text-[#005EB8] hover:underline ml-3">Configure</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 pt-4 border-t border-[#E4E6E8] flex items-center gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1A6B4D] text-white rounded-md text-sm font-medium hover:bg-[#145A3F] transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              {saved && (
                <span className="flex items-center gap-1 text-xs text-[#1A6B4D]">
                  <CheckCircle2 className="w-4 h-4" />
                  Settings saved successfully
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
