/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Sliders, 
  Building2, 
  ToggleLeft, 
  BellRing, 
  Database, 
  Radio, 
  Wrench, 
  Wifi, 
  Server, 
  Smartphone,
  CheckCircle2,
  Lock,
  Compass
} from "lucide-react";

interface SettingsProps {
  selectedProperty: string;
  setSelectedProperty: (prop: string) => void;
  emergencyActive: boolean;
  setEmergencyActive: (active: boolean) => void;
  onAddTicket: (ticket: any) => Promise<void>;
}

export default function Settings({
  selectedProperty,
  setSelectedProperty,
  emergencyActive,
  setEmergencyActive,
  onAddTicket
}: SettingsProps) {
  
  // Local config toggles
  const [useAIAutoPredict, setUseAIAutoPredict] = React.useState(true);
  const [liveSensorsPoll, setLiveSensorsPoll] = React.useState(true);
  const [notifyVIP, setNotifyVIP] = React.useState(true);
  
  // Notification log simulated toast
  const [customToast, setCustomToast] = React.useState<string | null>(null);

  const simulateHardwareIssue = async (system: string, detail: string) => {
    try {
      await onAddTicket({
        system,
        roomNumber: "105",
        issue: `[Hardware Simulation Trigger] ${detail}. Telemetry warning registered on secondary relay board.`,
        priority: "High",
        assignedTechnician: system === "AC" || system === "Plumbing" ? "Marcus Vance" : "Sylvia Chen"
      });
      setCustomToast(`SUCCESS: Injected simulation fault for ${system}. See active dispatches.`);
      setTimeout(() => setCustomToast(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="settings-view-root" className="space-y-6 max-w-4xl mx-auto font-sans text-zinc-950">
      
      {/* Header section */}
      <div className="border-b border-zinc-250 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-sans">SaaS System Configurations</h2>
        <p className="text-xs text-zinc-500 mt-1 font-mono">INTELLIGENCE THRESHOLDS • SIMULATION CONTROLS • EMERGENCY BROADCAST</p>
      </div>

      {/* Success banner if triggered */}
      {customToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-220 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{customToast}</span>
        </div>
      )}

      {/* Settings Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left main: Property details & core toggles */}
        <div className="space-y-4">
          
          {/* Property Identity Card */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-zinc-500" />
              <span>Property Branding Node</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-400 block font-mono">SaaS REGISTERED ACTIVE NODE</label>
                <div className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-zinc-800 font-bold flex items-center justify-between">
                  <span>{selectedProperty}</span>
                  <span className="text-[9px] text-zinc-500 font-sans tracking-wide border border-zinc-200 px-1.5 py-0.5 rounded bg-white font-normal">
                    Read-Only
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-sans mt-1.5">
                  * Changing active branches is restricted. You can switch branches inside the <span className="font-semibold text-zinc-600">Rooms & Floors</span> section.
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-150 text-[11px] text-zinc-500 leading-relaxed font-sans">
                Each node executes isolated hotel operations data, cleaning standard timer clocks, and localized predictive sensor routines.
              </div>
            </div>
          </div>

          {/* SaaS Telemetry thresholds switches */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-zinc-500" />
              <span>Automated Telemetry Parameters</span>
            </h3>

            <div className="space-y-3.5 pt-1.5">
              
              {/* Toggle 1: AI auto predict */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-900 block leading-none mb-1">Aura AI Pre-emptives active</span>
                  <span className="text-[11px] text-zinc-400 leading-none">Auto-fire preventative dispatches on cable deviation detections</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseAIAutoPredict(!useAIAutoPredict)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    useAIAutoPredict ? "bg-emerald-500" : "bg-zinc-200"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    useAIAutoPredict ? "translate-x-4" : ""
                  }`} />
                </button>
              </div>

              {/* Toggle 2: Polling */}
              <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                <div>
                  <span className="text-xs font-bold text-zinc-900 block leading-none mb-1">Live water tank sensing active</span>
                  <span className="text-[11px] text-zinc-400 leading-none">Monitor hydrostatic sensors every 5000ms</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLiveSensorsPoll(!liveSensorsPoll)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    liveSensorsPoll ? "bg-emerald-500" : "bg-zinc-200"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    liveSensorsPoll ? "translate-x-4" : ""
                  }`} />
                </button>
              </div>

              {/* Toggle 3: VIP */}
              <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                <div>
                  <span className="text-xs font-bold text-zinc-900 block leading-none mb-1">VIP Proximity Alerts broadcast</span>
                  <span className="text-[11px] text-zinc-400 leading-none">Notify supervisor desk 30m prior to check-in ETA</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyVIP(!notifyVIP)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    notifyVIP ? "bg-emerald-500" : "bg-zinc-200"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    notifyVIP ? "translate-x-4" : ""
                  }`} />
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Right side: Hardware Simulations testing suite */}
        <div className="space-y-4">
          
          {/* Failures injection panel */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-zinc-500" />
              <span>Hardware Fault Simulator Tools</span>
            </h3>
            
            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
              Inject hardware sensor deviations immediately to test reactive workflows. Doing so mimics water overflows, offline routers, or heating faults on active maps:
            </p>

            <div className="space-y-2 pt-2">
              
              {/* Action 1: Elev block */}
              <button
                type="button"
                onClick={() => simulateHardwareIssue("Lift", "Cable vibration reading touched 3.1 mm limit. Automatic safety lock triggered.")}
                className="w-full flex items-center justify-between p-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-xs font-semibold text-zinc-905 block">Force Lift Cable High Deviation</span>
                    <span className="text-[9px] text-zinc-400 font-mono">SYSTEM: ELEVATORS • BLOCK B</span>
                  </div>
                </div>
                <Radio className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
              </button>

              {/* Action 2: HVAC fail */}
              <button
                type="button"
                onClick={() => simulateHardwareIssue("AC", "Primary heat exchanger filter backpressure exceeded normal thresholds. Fan lockup imminent.")}
                className="w-full flex items-center justify-between p-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-zinc-650" />
                  <div>
                    <span className="text-xs font-semibold text-zinc-905 block">Simulate AC Compressor Trip</span>
                    <span className="text-[9px] text-zinc-400 font-mono">SUITE: ROOM 105 • BLOCK CORE</span>
                  </div>
                </div>
                <Radio className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* Action 3: AP offline */}
              <button
                type="button"
                onClick={() => simulateHardwareIssue("WiFi", "Elevated corridor AP client authentication limit reached. Memory allocation timeout.")}
                className="w-full flex items-center justify-between p-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-blue-500" />
                  <div>
                    <span className="text-xs font-semibold text-zinc-905 block">Inject guest Corridor WiFi AP Jam</span>
                    <span className="text-[9px] text-zinc-400 font-mono">NETWORK: ROUTER_CORE_302</span>
                  </div>
                </div>
                <Radio className="w-3.5 h-3.5 text-zinc-400" />
              </button>

            </div>
          </div>

          {/* Emergency Panic system overview details */}
          <div className="bg-red-950/10 border border-red-900/30 p-5 rounded-xl space-y-3.5 text-zinc-950 font-sans">
            <span className="text-[9px] font-mono tracking-wider font-extrabold uppercase text-red-700 flex items-center gap-1 animate-pulse">
              <Radio className="w-3.5 h-3.5 animate-bounce" />
              <span>Physical Alarm Override system</span>
            </span>
            <h4 className="text-sm font-bold text-red-950 leading-none">System-Wide Broadcast Lever</h4>
            <p className="text-xs text-red-900/80 leading-relaxed font-sans">
              Engaging the main Emergency Alarm overrides active frontdesk panels to Broadcast instructions, locks elevators automatically, schedules emergency water drops, and maps alarm locations. Use with extreme caution.
            </p>
            <button
              onClick={() => setEmergencyActive(!emergencyActive)}
              className={`w-full py-2 border rounded-lg text-xs font-bold transition cursor-pointer text-center block ${
                emergencyActive 
                  ? "bg-red-600 border-red-500 text-white animate-pulse" 
                  : "bg-red-950/20 border-red-900/40 text-red-700 hover:bg-red-950/30"
              }`}
            >
              {emergencyActive ? "DEACTIVATE EXTREME ALARM BROADCAST" : "ACTIVATE TEST OVERLAY EMERGENCY BROADCAST"}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
