/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  LayoutDashboard, 
  BedDouble, 
  Sparkles, 
  Wrench, 
  Users, 
  ShieldCheck, 
  BarChart3, 
  Sliders, 
  BrainCircuit, 
  Building2, 
  Radio, 
  AlertOctagon,
  ChevronDown,
  X
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  operationalHealthScore: number;
  activeNotificationsCount: number;
  selectedProperty: string;
  setSelectedProperty: (prop: string) => void;
  emergencyActive: boolean;
  setEmergencyActive: (active: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  operationalHealthScore,
  activeNotificationsCount,
  selectedProperty,
  setSelectedProperty,
  emergencyActive,
  setEmergencyActive,
  isOpen = false,
  onClose = () => {}
}: SidebarProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "rooms", label: "Rooms & Floors", icon: BedDouble },
    { id: "housekeeping", label: "Housekeeping", icon: Sparkles },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "guests", label: "Guest Ledger", icon: Users },
    { id: "staff", label: "Staff & Shifts", icon: ShieldCheck },
    { id: "ai-assistant", label: "Aura AI Advisor", icon: BrainCircuit, highlight: true },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Sliders },
  ];

  const properties = [
    "InnSync Central Flagship",
    "InnSync Seattle Summit",
    "InnSync Portland Heights",
  ];

  return (
    <aside 
      id="sidebar-container" 
      className={`fixed top-0 left-0 h-screen w-64 bg-zinc-950 text-zinc-200 border-r border-zinc-800 flex flex-col justify-between font-sans transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? "translate-x-0 z-50" : "-translate-x-full lg:z-30 z-40"
      }`}
    >
      {/* Upper Brand Section */}
      <div className="flex flex-col p-4">
        {/* Multi-Property Switcher Dropdown */}
        <div className="relative mb-6">
          <div 
            id="property-switcher-btn"
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-left text-sm font-medium text-zinc-300"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="truncate max-w-[150px]">{selectedProperty}</span>
            </div>
            <span className="text-[9px] text-zinc-500 font-mono uppercase bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
              Active Node
            </span>
          </div>
        </div>

        {/* Brand Logo Header */}
        <div className="flex items-center justify-between px-2 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 rounded-md flex items-center justify-center text-emerald-400 font-bold font-mono text-sm shadow">
              I
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white leading-none">InnSync</h1>
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Hospitality SaaS</span>
            </div>
          </div>
          
          {/* Mobile close menu trigger */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition duration-150 cursor-pointer"
            title="Close menu drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Link List */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                id={`sidebar-tab-${item.id}`}
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group duration-150 cursor-pointer ${
                  isActive
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 flex-shrink-0 transition ${
                    isActive ? "text-white" : item.highlight ? "text-purple-400" : "text-zinc-400 group-hover:text-zinc-200"
                  }`} />
                  <span className={item.highlight ? "text-purple-300 font-semibold" : ""}>
                    {item.label}
                  </span>
                </div>
                {item.id === "dashboard" && activeNotificationsCount > 0 && (
                  <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold">
                    {activeNotificationsCount}
                  </span>
                )}
                {item.id === "ai-assistant" && (
                  <span className="bg-purple-500/15 text-purple-300 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold animate-pulse scale-90">
                    Live
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls & Emergency State */}
      <div className="p-4 space-y-3.5 border-t border-zinc-900 bg-zinc-950">
        {/* System Health Metric Bar */}
        <div className="space-y-1 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-900">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-400">OPS HEALTH</span>
            <span className={`font-semibold ${
              operationalHealthScore > 90 ? "text-emerald-400" : "text-amber-400"
            }`}>{operationalHealthScore}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                operationalHealthScore > 90 ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${operationalHealthScore}%` }}
            />
          </div>
        </div>

        {/* Emergency Panic Lever button */}
        <button
          id="panic-broadcast-btn"
          onClick={() => setEmergencyActive(!emergencyActive)}
          className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-semibold cursor-pointer border hover:-translate-y-0.5 transition-all text-center ${
            emergencyActive 
              ? "bg-red-600 border-red-500 text-white animate-pulse shadow-md shadow-red-900/30" 
              : "bg-red-950/20 border-red-900/40 text-red-400 hover:bg-red-950/40"
          }`}
        >
          {emergencyActive ? (
            <>
              <Radio className="w-3.5 h-3.5 animate-bounce" />
              <span>EMERGENCY DISPATCH LIVE</span>
            </>
          ) : (
            <>
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>EMERGENCY ALARM</span>
            </>
          )}
        </button>

        {/* Operations Center Status Indicator */}
        <div className="flex items-center gap-2 px-1">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">NODE_CENTRAL_SECURE</span>
        </div>
      </div>
    </aside>
  );
}
