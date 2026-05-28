/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Building2, 
  BedDouble, 
  Sparkles, 
  Wrench, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Activity, 
  Plus, 
  DoorClosed, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2,
  PhoneCall,
  X
} from "lucide-react";
import { Room, MaintenanceTicket, Guest, StaffMember, HotelNotification } from "../types";

interface DashboardProps {
  rooms: Room[];
  tickets: MaintenanceTicket[];
  guests: Guest[];
  staff: StaffMember[];
  notifications: HotelNotification[];
  revenueToday: number;
  operationalHealthScore: number;
  activeComplaints: number;
  onCheckin: (guestId: string, roomId: string) => Promise<void>;
  onCheckout: (roomId: string) => Promise<void>;
  onAddTicket: (ticket: any) => Promise<void>;
  onOptimizeRevenue?: () => Promise<any>;
  financials?: {
    todayRevenue: number;
    avgDailyRate: number;
    revpar: number;
    growthPercentage: number;
  } | null;
}

export default function Dashboard({
  rooms,
  tickets,
  guests,
  staff,
  notifications,
  revenueToday,
  operationalHealthScore,
  activeComplaints,
  onCheckin,
  onCheckout,
  onAddTicket,
  onOptimizeRevenue,
  financials
}: DashboardProps) {
  // Modal states
  const [showCheckinModal, setShowCheckinModal] = React.useState(false);
  const [showTicketModal, setShowTicketModal] = React.useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = React.useState(false);

  // Form states
  const [selectedGuestId, setSelectedGuestId] = React.useState("");
  const [selectedRoomId, setSelectedRoomId] = React.useState("");
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [optimizeReport, setOptimizeReport] = React.useState<any>(null);
  
  const [ticketSystem, setTicketSystem] = React.useState<"AC" | "Lift" | "Plumbing" | "Electricity" | "WiFi" | "Water Leakage" | "Emergency">("AC");
  const [ticketRoom, setTicketRoom] = React.useState("");
  const [ticketIssue, setTicketIssue] = React.useState("");
  const [ticketPriority, setTicketPriority] = React.useState<"Low" | "Medium" | "High" | "Emergency">("High");

  const [loading, setLoading] = React.useState(false);

  const triggerRevenueOptimization = async () => {
    if (!onOptimizeRevenue || isOptimizing) return;
    setIsOptimizing(true);
    try {
      const res = await onOptimizeRevenue();
      if (res && res.success) {
        setOptimizeReport(res.report);
        setShowOptimizeModal(true);
      }
    } catch (e) {
      console.error("Failed executing dynamic revenue optimization: ", e);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Derive simple metrics from rooms
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === "Occupied").length;
  const availableRooms = rooms.filter(r => r.status === "Available").length;
  const reservedRooms = rooms.filter(r => r.status === "Reserved").length;
  const needsCleaningRooms = rooms.filter(r => r.status === "Needs Cleaning").length;
  const maintenanceRooms = rooms.filter(r => r.status === "Maintenance").length;

  // Active check-ins scheduled today (guests who are Reserved)
  const todayCheckinsList = guests.filter(g => g.status === "Reserved");
  const todayCheckoutsList = rooms.filter(r => r.status === "Occupied" && r.checkOutTime && new Date(r.checkOutTime).getDate() === new Date().getDate());

  // Filter out resolved tickets
  const activeTickets = tickets.filter(t => t.status !== "Resolved");

  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuestId || !selectedRoomId) return;
    setLoading(true);
    try {
      await onCheckin(selectedGuestId, selectedRoomId);
      setShowCheckinModal(false);
      setSelectedGuestId("");
      setSelectedRoomId("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketIssue) return;
    setLoading(true);
    try {
      await onAddTicket({
        system: ticketSystem,
        roomNumber: ticketRoom || null,
        issue: ticketIssue,
        priority: ticketPriority,
        assignedTechnician: ticketSystem === "AC" || ticketSystem === "Plumbing" ? "Marcus Vance" : "Sylvia Chen"
      });
      setShowTicketModal(false);
      setTicketIssue("");
      setTicketRoom("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="dashboard-tab-content" className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-950">
      {/* Upper header action list */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-250 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Control Center</h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">LUMINA FRONTDESK OPERATIONS CENTRAL • 2026 GENERAL MANAGER ACTIVE VIEW</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="open-checkin-modal"
            onClick={() => setShowCheckinModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer shadow-sm"
          >
            <DoorClosed className="w-3.5 h-3.5" />
            <span>Check-in Guest</span>
          </button>
          <button
            id="open-ticket-modal"
            onClick={() => setShowTicketModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-zinc-900 border border-zinc-250 hover:bg-zinc-50 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-500" />
            <span>File Dispatch Ticket</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Statistics Card Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* KPI: Health Score */}
        <div id="kpi-health" className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-medium">OPS HEALTH</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900">{operationalHealthScore}%</h3>
            <p className="text-[10px] text-zinc-500 mt-1">Smart telemetry status</p>
          </div>
        </div>

        {/* Total Rooms Block */}
        <div id="kpi-total" className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-medium">TOTAL ROOMS</span>
            <Building2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900">{totalRooms}</h3>
            <p className="text-[10px] text-zinc-500 mt-1">Beds: 14 / Suites: 4</p>
          </div>
        </div>

        {/* Room Status breakdown Available / Occupied */}
        <div id="kpi-occupancy" className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-medium">OCCUPANCY</span>
            <BedDouble className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900">
              {occupiedRooms} <span className="text-sm font-normal text-zinc-400">/ {totalRooms}</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">{availableRooms} available • {reservedRooms} reserved</p>
          </div>
        </div>

        {/* Needs Cleaning */}
        <div id="kpi-cleaning" className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-medium">CLEANING STATUS</span>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900">
              {needsCleaningRooms} <span className="text-xs font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-1 font-semibold">Needs Sweeping</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">Pending: {needsCleaningRooms} room schedules</p>
          </div>
        </div>

        {/* Maintenance */}
        <div id="kpi-maintenance" className="bg-zinc-900 text-white p-4 rounded-xl border border-zinc-850 flex flex-col justify-between shadow-xs col-span-1 sm:col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-zinc-550">
            <span className="text-xs font-mono font-medium">ACTIVE ALERTS</span>
            <Wrench className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-100">{activeComplaints}</h3>
            <p className="text-[10px] text-zinc-400 mt-1">Open maintenance dispatches</p>
          </div>
        </div>
      </div>

      {/* Secondary Dashboard Grid (Revenue, Active Complaints list, Schedule arrivals) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main: Active Warnings & Maintenance Tickets */}
        <div id="active-tasks-bento" className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-zinc-150 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Critical Operational Faults & Predictive Alerts</span>
              </h3>
              <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold">
                {activeTickets.length} DISPATCHES
              </span>
            </div>

            <div className="divide-y divide-zinc-150">
              {activeTickets.length === 0 ? (
                <div className="p-8 text-center text-zinc-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs">No active technical alerts on monitoring grid.</p>
                </div>
              ) : (
                activeTickets.map(ticket => (
                  <div key={ticket.id} className="p-4 hover:bg-zinc-50/60 transition flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider font-semibold uppercase ${
                          ticket.priority === "Emergency" ? "bg-red-100 text-red-700 font-bold animate-pulse" :
                          ticket.priority === "High" ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-700"
                        }`}>
                          {ticket.priority} Priority
                        </span>
                        {ticket.isPredictive && (
                          <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase">
                            PREDICTIVE SENSOR AI
                          </span>
                        )}
                        <span className="text-xs font-semibold text-zinc-900 font-mono">
                          {ticket.system} System {ticket.roomNumber ? `• Room ${ticket.roomNumber}` : ""}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-640">{ticket.issue}</p>
                      {ticket.notes && (
                        <p className="text-[11px] text-zinc-500 font-serif italic">Note: {ticket.notes}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        {new Date(ticket.creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[11px] text-zinc-600 font-medium block mt-1">
                        👉 {ticket.assignedTechnician}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rapid Action Quick Actions Strip */}
          <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={() => onCheckout("101")}
              className="px-3 py-2.5 bg-white border border-zinc-250 hover:bg-zinc-100 rounded-lg text-left transition text-zinc-950 font-sans cursor-pointer group"
            >
              <DoorClosed className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 mb-1.5" />
              <div className="text-xs font-semibold">Force Checkout 101</div>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-none">Instant vacate & clean transition</p>
            </button>

            <button 
              onClick={() => {
                onAddTicket({
                  system: "WiFi",
                  roomNumber: "201",
                  issue: "Sub-router in laundry corridor signal strength degradation under load",
                  priority: "Low",
                  assignedTechnician: "Sylvia Chen"
                });
              }}
              className="px-3 py-2.5 bg-white border border-zinc-250 hover:bg-zinc-100 rounded-lg text-left transition text-zinc-950 font-sans cursor-pointer group"
            >
              <TrendingUp className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 mb-1.5" />
              <div className="text-xs font-semibold">Simulate WiFi Signal Drop</div>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-none">Trigger preventative alarm</p>
            </button>

            <button 
              onClick={() => {
                onAddTicket({
                  system: "Emergency",
                  roomNumber: "304",
                  issue: "Emergency smoke alarm sensor high-temp calibration check required",
                  priority: "Emergency",
                  assignedTechnician: "Sylvia Chen"
                });
              }}
              className="px-3 py-2.5 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg text-left transition cursor-pointer group"
            >
              <AlertTriangle className="w-4 h-4 text-red-500 mb-1.5" />
              <div className="text-xs font-semibold text-red-900">Simulate Sensor Fault</div>
              <p className="text-[10px] text-red-500/80 mt-0.5 leading-none">Fire & safety alert sweep</p>
            </button>

            <button 
              onClick={() => {
                setShowCheckinModal(true);
              }}
              className="px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-left transition cursor-pointer group"
            >
              <Users className="w-4 h-4 text-emerald-400 mb-1.5" />
              <div className="text-xs font-semibold">VIP Pre-Assign Suite</div>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-none">Allocate 302/304 for arrival</p>
            </button>
          </div>
        </div>

        {/* Right main column: Today's arrivals checklist, revenue performance snapshot, VIP indicator, notifications */}
        <div className="space-y-4">
          {/* Revenue meter */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-3 relative overflow-hidden">
            {!financials ? (
              /* Premium skeleton loader */
              <div className="space-y-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-zinc-150 rounded w-24" />
                  <div className="h-10 bg-emerald-50 rounded-lg w-28" />
                </div>
                <div className="space-y-2 pt-1">
                  <div className="h-8 bg-zinc-200 rounded w-36" />
                  <div className="h-3 bg-zinc-150 rounded w-48" />
                </div>
              </div>
            ) : (
              /* Real metrics display */
              <>
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-mono font-medium uppercase tracking-wider">TODAY REVENUE</span>
                  
                  {/* Premium multi-line green badge/pill */}
                  <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-lg px-2.5 py-1 flex flex-col items-end hover:bg-emerald-100/80 transition shadow-2xs select-none cursor-pointer">
                    <span className="text-[8.5px] font-bold font-sans uppercase tracking-wider text-emerald-600 leading-tight">Revenue Growth</span>
                    <span className="text-xs font-bold font-mono text-emerald-700 flex items-center gap-0.5 mt-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                      <span>+{financials.growthPercentage}%</span>
                    </span>
                  </div>
                </div>
                
                <div className="pt-1">
                  <h4 className="text-3xl font-extrabold tracking-tight text-zinc-900">
                    ₹{financials.todayRevenue.toLocaleString()}
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-2 font-sans">
                    Average Daily Rate: <span className="font-semibold text-zinc-700">₹{financials.avgDailyRate}</span> • RevPAR: <span className="font-semibold text-zinc-700">₹{financials.revpar}</span>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Today's guest checks (Check-ins ledger & check-outs ledger) */}
          <div className="bg-zinc-900 text-zinc-100 rounded-xl border border-zinc-850 p-4 space-y-4">
            <div className="border-b border-zinc-800 pb-2.5 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Today's Flow Checklist</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">28 MAY '26</span>
            </div>

            {/* Check-ins list */}
            <div className="space-y-2.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Scheduled Check-ins ({todayCheckinsList.length})</span>
              {todayCheckinsList.length === 0 ? (
                <p className="text-xs text-zinc-500">All scheduled guests Checked-In for the day.</p>
              ) : (
                <div className="space-y-2">
                  {todayCheckinsList.map(guest => (
                    <div key={guest.id} className="flex items-center justify-between bg-zinc-850 p-2.5 rounded-lg border border-zinc-800">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-white">{guest.name}</span>
                          {guest.isVIP && <span className="bg-purple-900/40 text-purple-300 border border-purple-800/60 px-1 rounded text-[8px] font-bold">VIP</span>}
                        </div>
                        <p className="text-[10px] text-zinc-400 font-mono">Room {guest.assignedRoom || "Unassigned"}</p>
                      </div>
                      <button 
                        onClick={() => {
                          const roomObj = rooms.find(r => r.roomNumber === guest.assignedRoom);
                          if (roomObj) {
                            onCheckin(guest.id, roomObj.id);
                          } else {
                            // default to first available
                            const avail = rooms.find(r => r.status === "Available");
                            if (avail) onCheckin(guest.id, avail.id);
                          }
                        }}
                        className="px-2.5 py-1 bg-white text-zinc-900 hover:bg-zinc-100 text-[10px] font-semibold rounded cursor-pointer leading-tight"
                      >
                        Fast Checkin
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Check-outs list */}
            <div className="space-y-2.5 pt-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Scheduled Departures ({todayCheckoutsList.length})</span>
              {todayCheckoutsList.length === 0 ? (
                <p className="text-xs text-zinc-500">Empty check-out queue for afternoon windows.</p>
              ) : (
                <div className="space-y-2">
                  {todayCheckoutsList.map(room => (
                    <div key={room.id} className="flex items-center justify-between bg-zinc-850 p-2.5 rounded-lg border border-zinc-800">
                      <div>
                        <span className="text-xs font-semibold text-white block">Room {room.roomNumber}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Guest: {guests.find(g => g.id === room.assignedGuestId)?.name || "N/A"}
                        </span>
                      </div>
                      <button 
                        onClick={() => onCheckout(room.id)}
                        className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700 text-[10px] font-semibold rounded cursor-pointer leading-tight"
                      >
                        Check Out
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: CHECKIN GUEST FOR FRONTDESK */}
      {showCheckinModal && (
        <div 
          id="checkin-modal-backdrop" 
          onClick={() => setShowCheckinModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl border border-zinc-200 max-w-sm w-full shadow-2xl overflow-hidden text-zinc-950 font-sans cursor-default"
          >
            <div className="px-5 py-4 border-b border-zinc-150 flex items-center justify-between bg-zinc-50">
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5">
                <DoorClosed className="w-4 h-4 text-emerald-500" />
                <span>Assign Frontdesk Check-in</span>
              </h3>
              <button 
                onClick={() => setShowCheckinModal(false)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckinSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold font-mono text-zinc-500 block">SELECT RESERVED GUEST</label>
                <select
                  required
                  value={selectedGuestId}
                  onChange={(e) => setSelectedGuestId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-250 rounded-lg outline-none cursor-pointer text-zinc-800"
                >
                  <option value="">-- Choose guest profile --</option>
                  {guests.filter(g => g.status === "Reserved").map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} {g.isVIP ? "(VIP)" : ""} - {g.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold font-mono text-zinc-500 block">CHOOSE ROOM (ONLY CLEAN & AVAILABLE)</label>
                <select
                  required
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-250 rounded-lg outline-none cursor-pointer text-zinc-800"
                >
                  <option value="">-- Choose available room --</option>
                  {rooms.filter(r => r.status === "Available" || r.status === "Reserved").map(r => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} ({r.roomType}) - Floor {r.floorNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  {loading ? "Processing..." : "Complete Room Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD DISPATCH MAINTENANCE TICKET */}
      {showTicketModal && (
        <div 
          id="ticket-modal-backdrop" 
          onClick={() => setShowTicketModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl border border-zinc-200 max-w-sm w-full shadow-2xl overflow-hidden text-zinc-950 font-sans cursor-default"
          >
            <div className="px-5 py-4 border-b border-zinc-150 flex items-center justify-between bg-zinc-50">
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-zinc-600" />
                <span>File Technical Dispatch Ticket</span>
              </h3>
              <button 
                onClick={() => setShowTicketModal(false)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold font-mono text-zinc-500 block">SYSTEM APPARATUS</label>
                  <select
                    value={ticketSystem}
                    onChange={(e: any) => setTicketSystem(e.target.value)}
                    className="w-full text-xs p-2 bg-zinc-50 border border-zinc-250 rounded-lg outline-none text-zinc-800"
                  >
                    <option value="AC">AC Unit</option>
                    <option value="Lift">Lift/Elevator</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electricity">Electricity</option>
                    <option value="WiFi">WiFi Route</option>
                    <option value="Water Leakage">Water Leakage</option>
                    <option value="Emergency">Emergency Alert</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold font-mono text-zinc-500 block">ROOM / SECTOR</label>
                  <input
                    placeholder="e.g. 101 or Floor 2 AP"
                    value={ticketRoom}
                    onChange={(e) => setTicketRoom(e.target.value)}
                    className="w-full text-xs p-2 bg-zinc-50 border border-zinc-250 rounded-lg outline-none text-zinc-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold font-mono text-zinc-500 block">URGENCY RATIO</label>
                <select
                  value={ticketPriority}
                  onChange={(e: any) => setTicketPriority(e.target.value)}
                  className="w-full text-xs p-2 bg-zinc-50 border border-zinc-250 rounded-lg outline-none text-zinc-800"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High Priority</option>
                  <option value="Emergency">Emergency Red Alert</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold font-mono text-zinc-500 block">PROBLEM SPECIFICATION</label>
                <textarea
                  required
                  placeholder="AC compressor cycles off repeatedly, causing room warming..."
                  rows={3}
                  value={ticketIssue}
                  onChange={(e) => setTicketIssue(e.target.value)}
                  className="w-full text-xs p-2 bg-zinc-50 border border-zinc-250 rounded-lg outline-none text-zinc-800 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  {loading ? "Processing..." : "Create Dispatch Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic AI Revenue Optimization Modal */}
      {showOptimizeModal && optimizeReport && (
        <div 
          onClick={() => setShowOptimizeModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] cursor-default"
          >
            <div className="bg-zinc-950 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500 text-zinc-950 p-1.5 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">AI Pricing & Dynamic Upcharge Report</h3>
                  <p className="text-[10px] text-zinc-400 font-mono">INNSYNC REVENUE MANAGEMENT HUB</p>
                </div>
              </div>
              <button 
                onClick={() => setShowOptimizeModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-emerald-800 font-mono font-bold uppercase tracking-wider">INCREMENTAL REVENUE CAPTURED</div>
                  <div className="text-3xl font-black text-emerald-950 mt-1">₹{optimizeReport.upsellRevenue?.toLocaleString()}</div>
                </div>
                <div className="bg-emerald-500 text-white rounded-lg p-3 shadow-md animate-pulse">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-zinc-50 border border-zinc-205 p-3 rounded-lg">
                  <div className="text-[10px] text-zinc-400 font-mono font-bold uppercase">SUITES ELIGIBLE</div>
                  <div className="text-xl font-bold text-zinc-800 mt-1">{optimizeReport.upgradeOpportunities} Suite(s)</div>
                </div>
                <div className="bg-zinc-50 border border-zinc-205 p-3 rounded-lg">
                  <div className="text-[10px] text-zinc-400 font-mono font-bold uppercase">RATE MULTIPLIER</div>
                  <div className="text-xl font-bold text-zinc-800 mt-1">1.25x Dynamic</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-800 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>DISPATCH RECOMMENDATIONS</span>
                </h4>
                <div className="space-y-2">
                  {optimizeReport.recommendations?.map((rec: string, index: number) => (
                    <div key={index} className="bg-zinc-50 border border-zinc-150 p-3 rounded-lg text-xs leading-relaxed text-zinc-700 flex gap-2">
                      <span className="font-bold text-zinc-950 text-emerald-600 font-mono">{index + 1}.</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-150 p-4 bg-zinc-50 flex gap-3">
              <button 
                onClick={() => setShowOptimizeModal(false)}
                className="flex-1 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold rounded-lg text-xs cursor-pointer transition text-center"
              >
                Close Audit
              </button>
              <button 
                onClick={() => setShowOptimizeModal(false)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs cursor-pointer transition text-center shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply Optimization</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
