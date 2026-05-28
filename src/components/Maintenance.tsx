/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Wrench, 
  Settings, 
  Activity, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  CheckSquare, 
  Wifi, 
  Droplet, 
  ShieldAlert,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { MaintenanceTicket } from "../types";

interface MaintenanceProps {
  tickets: MaintenanceTicket[];
  onUpdateTicketStatus: (ticketId: string, status: "In Progress" | "Resolved", notes?: string) => Promise<void>;
  onAddTicket: (ticket: any) => Promise<void>;
}

export default function Maintenance({
  tickets,
  onUpdateTicketStatus,
  onAddTicket
}: MaintenanceProps) {

  const [activeTab, setActiveTab] = React.useState<"active" | "resolved">("active");
  const [ticketFilter, setTicketFilter] = React.useState<string>("all");
  const [workingOnId, setWorkingOnId] = React.useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = React.useState("");

  // Filters
  const filteredTickets = tickets.filter(t => {
    const matchStatus = activeTab === "active" ? t.status !== "Resolved" : t.status === "Resolved";
    const matchSystem = ticketFilter === "all" || t.system === ticketFilter;
    return matchStatus && matchSystem;
  });

  // Physical Apparatai State Map Mocked
  const systemStatusList = [
    { name: "Lift B elevator", status: "Governed Speed (50%)", icon: Settings, condition: "Yellow Alert", health: 74 },
    { name: "Main Corridors AC", status: "Operational", icon: Activity, condition: "Clean", health: 91 },
    { name: "Water Tank Levels", status: "14% Capacity Limit (Low)", icon: Droplet, condition: "Danger Low", health: 48 },
    { name: "Guest Corridors WiFi", status: "Operational", icon: Wifi, condition: "Clean", health: 88 }
  ];

  // Predictive Alerts defined
  const predictiveAlerts = [
    {
      id: "pred-1",
      title: "Repeated AC Compressor Failure Alert (Room 105)",
      desc: "HVAC telemetry recorded 4 short-cycle trip occurrences over 48h. Compressor motor coil thermal threshold exceeded standard margin by 14°C.",
      recommendation: "Assign Marcus Vance to replace the run capacitor and re-inspect electrical contacts before thermal blowout.",
      affectedSys: "AC"
    },
    {
      id: "pred-2",
      title: "Overdue Lift Cable Calibration Overhaul",
      desc: "Standard cable safety alignment metrics reflect slight tension deviation of 2.2 mm. Failure to realign within 72h will lock system to emergency brake overrides.",
      recommendation: "Deploy technician Sylvia Chen to run the cable realignment sequence.",
      affectedSys: "Lift"
    }
  ];

  const handleStartWork = async (ticketId: string) => {
    try {
      await onUpdateTicketStatus(ticketId, "In Progress", "Technician has clocked in on floor sector. Commenced repair checklist.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveOpenForm = (ticketId: string) => {
    setWorkingOnId(ticketId);
    setResolutionNote("Replaced faulty valve mechanism, verified normal flow, and wiped sector clean.");
  };

  const submitResolution = async (ticketId: string) => {
    if (!resolutionNote) return;
    try {
      await onUpdateTicketStatus(ticketId, "Resolved", resolutionNote);
      setWorkingOnId(null);
      setResolutionNote("");
    } catch (err) {
      console.error(err);
    }
  };

  const triggerPredictiveDispatch = async (alert: typeof predictiveAlerts[0]) => {
    try {
      await onAddTicket({
        system: alert.affectedSys,
        issue: `[Preventative Auto-Dispatch] ${alert.title}. Detail: ${alert.desc}`,
        priority: "High",
        assignedTechnician: alert.affectedSys === "AC" ? "Marcus Vance" : "Sylvia Chen",
        isPredictive: true
      });
      alert.desc = "Dispatch ticket filed successfully. Technician en route.";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="maintenance-view-root" className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-950">
      
      {/* Tab bar headers */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-250 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Technical Assets Monitor</h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">PREDICTIVE SENSORS • WORK DISPATCHES • SYSTEM REPAIRS</p>
        </div>

        {/* Filters and List tabs */}
        <div className="flex items-center bg-zinc-100 p-1.5 rounded-lg border border-zinc-200">
          <button
            id="maintenance-tab-active"
            onClick={() => setActiveTab("active")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
              activeTab === "active" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Active Tickets
          </button>
          <button
            id="maintenance-tab-resolved"
            onClick={() => setActiveTab("resolved")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
              activeTab === "resolved" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Resolved History
          </button>
        </div>
      </div>

      {/* Grid: Split into systems status panel/predictive block and technical tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Physical Systems Health Board & AI Predictions */}
        <div className="space-y-4">
          
          {/* Realtime Sensors status panel */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-855 tracking-wider uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Real-Time Sensor Telemetry</span>
            </h3>

            <div className="space-y-3">
              {systemStatusList.map((sys, idx) => {
                const Icon = sys.icon;
                const isWarning = sys.condition.includes("Alert") || sys.condition.includes("Danger");
                
                return (
                  <div key={idx} className="p-3 bg-zinc-50 border border-zinc-150 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isWarning ? "text-amber-500" : "text-emerald-500"}`} />
                        <span className="font-bold text-zinc-850">{sys.name}</span>
                      </div>
                      <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                        isWarning ? "bg-amber-50 text-amber-700 animate-pulse" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {sys.condition}
                      </span>
                    </div>

                    {/* Progress Healthbar indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>Operational capacity:</span>
                        <span className="font-mono">{sys.health}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 h-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            sys.health > 80 ? 'bg-emerald-500' : sys.health > 50 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
                          }`}
                          style={{ width: `${sys.health}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Predictive Dispatch center */}
          <div className="bg-zinc-950 text-white rounded-xl p-5 border border-zinc-850 space-y-4 shadow-md">
            <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-purple-400 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Aura AI Predictive Diagnostics</span>
            </span>

            <div className="space-y-4">
              {predictiveAlerts.map(alert => (
                <div key={alert.id} className="space-y-2 border-b border-zinc-850 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-purple-300">{alert.title}</h5>
                    <span className="bg-purple-900/10 text-purple-400 border border-purple-800 text-[8px] font-bold px-1 rounded">PREDICTIVE</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{alert.desc}</p>
                  
                  <div className="p-2.5 bg-zinc-900 border border-zinc-850 rounded-lg text-[10px] text-zinc-350">
                    💡 <b className="text-zinc-200">Recommendation:</b> {alert.recommendation}
                  </div>

                  <button
                    onClick={() => triggerPredictiveDispatch(alert)}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-semibold transition cursor-pointer"
                  >
                    <span>Authorize Immediate Preventative Dispatch</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Active technical dispatches list (Column span 2) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Quick Filters */}
          <div className="bg-white border border-zinc-200 p-3.5 rounded-xl flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400 uppercase">SYS FILTER:</span>
            {["all", "AC", "Lift", "Plumbing", "Electricity", "WiFi"].map(sys => (
              <button
                key={sys}
                onClick={() => setTicketFilter(sys)}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition ${
                  ticketFilter === sys
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-50 border border-zinc-200 hover:bg-zinc-150 text-zinc-640"
                }`}
              >
                {sys === "all" ? "All Systems" : sys}
              </button>
            ))}
          </div>

          {/* Ticket Row logs */}
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="divide-y divide-zinc-150">
              {filteredTickets.length === 0 ? (
                <div className="p-12 text-center text-zinc-400">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-zinc-700">Perfect Mechanics Log</p>
                  <p className="text-xs mt-0.5">All filed dispatches are resolved or closed.</p>
                </div>
              ) : (
                filteredTickets.map(ticket => (
                  <div key={ticket.id} className="p-5 hover:bg-zinc-50/50 transition flex flex-col sm:flex-row items-start justify-between gap-4">
                    
                    {/* Left details grid */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-wider font-bold uppercase ${
                          ticket.priority === "Emergency" ? "bg-red-50 text-red-700 animate-pulse border border-red-200" :
                          ticket.priority === "High" ? "bg-amber-50 text-amber-700" : "bg-zinc-100 text-zinc-600"
                        }`}>
                          {ticket.priority} URGENCY
                        </span>
                        
                        <span className="text-sm font-extrabold text-zinc-900">
                          {ticket.system} system {ticket.roomNumber ? `• Room ${ticket.roomNumber}` : ""}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-700 font-sans">{ticket.issue}</p>
                      
                      {/* Ticket completion timeline details */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-zinc-400 font-mono pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Logged: {new Date(ticket.creationTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Assignee: <b className="text-zinc-650 font-semibold">{ticket.assignedTechnician}</b></span>
                        </span>
                      </div>

                      {/* Display issue photo if uploaded */}
                      {ticket.photoUrl && (
                        <div className="pt-2">
                          <div className="relative rounded-lg overflow-hidden border border-zinc-200 max-w-[150px] shadow-xs cursor-pointer group">
                            <img src={ticket.photoUrl} alt="Issue evidence" className="object-cover w-full h-20 group-hover:scale-105 transition duration-150" referrerPolicy="no-referrer" />
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] font-mono text-zinc-100 text-center py-0.5">
                              VEW EVIDENCE
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Log trace history notes */}
                      {ticket.notes && (
                        <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-150 mt-2 text-[11px] text-zinc-500 font-sans leading-relaxed">
                          📝 <b className="text-zinc-700 font-medium">Technician notes:</b> {ticket.notes}
                        </div>
                      )}

                      {/* Resolution actions dialog panel if working on */}
                      {workingOnId === ticket.id && (
                        <div className="pt-3.5 space-y-2.5 bg-zinc-50 border border-zinc-200 p-3.5 rounded-lg max-w-md">
                          <label className="text-[10px] font-bold text-zinc-500 block">SUBMIT RESOLUTION ANALYSIS</label>
                          <textarea
                            required
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            placeholder="State exact action taken (e.g., cleared blocking belt, replaced o-ring)..."
                            className="w-full text-xs p-2 bg-white border border-zinc-250 rounded outline-none"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => submitResolution(ticket.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded"
                            >
                              Authorize Resolve
                            </button>
                            <button
                              type="button"
                              onClick={() => setWorkingOnId(null)}
                              className="px-3.5 py-1.5 bg-zinc-250 text-zinc-600 text-xs rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right action button controllers (Dispatch status) */}
                    <div className="flex-shrink-0 text-right">
                      {activeTab === "active" ? (
                        <div className="space-y-2">
                          {ticket.status === "Open" && (
                            <button
                              onClick={() => handleStartWork(ticket.id)}
                              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg cursor-pointer transition"
                            >
                              Clock-in Ticket
                            </button>
                          )}
                          
                          {ticket.status === "In Progress" && workingOnId !== ticket.id && (
                            <button
                              onClick={() => handleResolveOpenForm(ticket.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete Fix</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold uppercase">RESOLVED ✔️</span>
                          <span className="text-[9px] text-zinc-400 font-mono block">
                            Out: {ticket.completionTime ? new Date(ticket.completionTime).toLocaleDateString() : ""}
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
