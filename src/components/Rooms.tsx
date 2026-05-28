/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Building, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  Wrench, 
  User, 
  Calendar, 
  ChevronRight, 
  Filter, 
  CheckSquare, 
  X,
  Plus
} from "lucide-react";
import { Room, Guest, StaffMember } from "../types";

interface RoomsProps {
  rooms: Room[];
  guests: Guest[];
  staff: StaffMember[];
  onUpdateRoomStatus: (roomId: string, status: any, cleaning?: any, maint?: any) => Promise<void>;
  onCheckout: (roomId: string) => Promise<void>;
  onAssignHousekeeping: (roomId: string, staffName: string, priority: string) => Promise<void>;
  onForceAvailable: (roomId: string) => Promise<void>;
  selectedProperty: string;
  setSelectedProperty: (property: string) => void;
}

export default function Rooms({
  rooms,
  guests,
  staff,
  onUpdateRoomStatus,
  onCheckout,
  onAssignHousekeeping,
  onForceAvailable,
  selectedProperty,
  setSelectedProperty
}: RoomsProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "floormap">("floormap");
  const [floorFilter, setFloorFilter] = React.useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);

  // Housekeeper assigning form state
  const [assignee, setAssignee] = React.useState("");
  const [priority, setPriority] = React.useState<"Low" | "Medium" | "High">("Medium");
  const [submitting, setSubmitting] = React.useState(false);

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const matchFloor = floorFilter === "all" || room.floorNumber === floorFilter;
    const matchStatus = statusFilter === "all" || room.status === statusFilter;
    return matchFloor && matchStatus;
  });

  const getStatusColorClass = (status: Room["status"]) => {
    switch (status) {
      case "Available": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Occupied": return "bg-rose-50 text-rose-700 border-rose-200";
      case "Needs Cleaning": return "bg-amber-55/80 text-amber-800 border-amber-200";
      case "Maintenance": return "bg-zinc-100 text-zinc-650 border-zinc-250";
      case "Reserved": return "bg-sky-50 text-sky-700 border-sky-200";
      default: return "bg-zinc-50 border-zinc-200 text-zinc-640";
    }
  };

  const getStatusDotColorClass = (status: Room["status"]) => {
    switch (status) {
      case "Available": return "bg-emerald-500 animate-pulse";
      case "Occupied": return "bg-rose-500";
      case "Needs Cleaning": return "bg-amber-500";
      case "Maintenance": return "bg-zinc-500";
      case "Reserved": return "bg-sky-500";
      default: return "bg-zinc-400";
    }
  };

  const handleHousekeepingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !assignee) return;
    setSubmitting(true);
    try {
      await onAssignHousekeeping(selectedRoom.id, assignee, priority);
      // reload locally or close
      const updated = rooms.find(r => r.id === selectedRoom.id);
      if (updated) setSelectedRoom(updated);
      setSelectedRoom(null); // dismiss
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const executeCheckout = async () => {
    if (!selectedRoom) return;
    setSubmitting(true);
    try {
      await onCheckout(selectedRoom.id);
      setSelectedRoom(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const executeCompleteCleaning = async () => {
    if (!selectedRoom) return;
    setSubmitting(true);
    try {
      await onForceAvailable(selectedRoom.id); // resets cleaning timer & sets status Available
      setSelectedRoom(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Group rooms by floors for the architectural layout view
  const floors = [3, 2, 1];

  return (
    <div id="rooms-view-root" className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-950">
      
      {/* Tab bar header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-250 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Room Operations Ledger</h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">ASSIGN ROOMS • MONITOR CLEANING STATUS • FLOOR VISUALIZATIONS</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center bg-zinc-100 p-1.5 rounded-lg border border-zinc-200">
          <button
            id="view-toggle-floormap"
            onClick={() => setViewMode("floormap")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
              viewMode === "floormap" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Structural Floor Map
          </button>
          <button
            id="view-toggle-grid"
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
              viewMode === "grid" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Compact Grid View
          </button>
        </div>
      </div>

      {/* Property Switcher Banner inside Rooms & Floors Section */}
      <div className="bg-zinc-900 text-white rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-zinc-800 shadow-sm">
        <div className="space-y-1">
          <div className="text-[10px] text-emerald-400 font-bold font-mono tracking-wider uppercase">Active Operations Control Hub</div>
          <h3 className="text-sm font-extrabold tracking-tight">Active Property Node: <span className="text-emerald-400 font-mono font-bold">{selectedProperty}</span></h3>
          <p className="text-[11px] text-zinc-400">Switching properties here dynamically updates localized room sensors, floor capacities, and cleaning logs.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: "InnSync Central Flagship", city: "Seattle, WA", code: "SEA-FLAG" },
            { id: "InnSync Seattle Summit", city: "Downtown", code: "SEA-SUMM" },
            { id: "InnSync Portland Heights", city: "Pearl District", code: "POR-HGTS" }
          ].map((branch) => {
            const isSelected = selectedProperty === branch.id;
            return (
              <button
                key={branch.id}
                onClick={() => setSelectedProperty(branch.id)}
                className={`flex-1 md:flex-initial px-3.5 py-2.5 rounded-lg text-left transition duration-150 cursor-pointer border ${
                  isSelected 
                    ? "bg-white text-zinc-900 border-white font-semibold" 
                    : "bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border-zinc-805"
                }`}
              >
                <div className="text-[9px] font-mono tracking-wider flex items-center justify-between gap-2">
                  <span className={isSelected ? "text-emerald-600 font-bold" : "text-zinc-500"}>{branch.code}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                </div>
                <div className="text-xs transition font-bold truncate leading-tight mt-0.5">{branch.id.replace("InnSync ", "")}</div>
                <div className="text-[9px] opacity-75">{branch.city}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls panel (Filters) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-mono text-zinc-500 uppercase">Filters:</span>
          </div>

          {/* Floor filter */}
          <select 
            value={floorFilter} 
            onChange={(e) => setFloorFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="text-xs px-2.5 py-1.5 bg-white border border-zinc-250 rounded-md outline-none cursor-pointer text-zinc-700"
          >
            <option value="all">All Floors</option>
            <option value="1">Floor 1 (Boutique Standard)</option>
            <option value="2">Floor 2 (Superior Suites)</option>
            <option value="3">Floor 3 (VIP & Penthouses)</option>
          </select>

          {/* Status filter */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-white border border-zinc-250 rounded-md outline-none cursor-pointer text-zinc-700"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available (Green)</option>
            <option value="Occupied">Occupied (Red)</option>
            <option value="Needs Cleaning">Needs Cleaning (Yellow)</option>
            <option value="Maintenance">Maintenance Block (Gray)</option>
            <option value="Reserved">Reserved (Blue)</option>
          </select>
        </div>

        <div className="text-right text-[11px] text-zinc-500 font-mono">
          Showing {filteredRooms.length} of {rooms.length} registered properties
        </div>
      </div>

      {/* VIEWPERSPECTIVE 1: FLOOR MAP (ARCHITECTURAL DISPLAY BOXES) */}
      {viewMode === "floormap" && (
        <div id="floormap-view" className="space-y-6">
          {floors.map(floorNum => {
            const floorRooms = rooms.filter(r => r.floorNumber === floorNum);
            // apply floor filter check
            if (floorFilter !== "all" && floorFilter !== floorNum) return null;

            return (
              <div key={floorNum} className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
                {/* Structural Section Header */}
                <div className="bg-zinc-50 px-5 py-3 border-b border-zinc-150 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-mono flex items-center justify-center font-bold text-xs">
                      L{floorNum}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-zinc-900">Floor {floorNum}</h3>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {floorNum === 3 ? "VIP Suites & Executive Penthouses" : floorNum === 2 ? "Superior Deluxe Wing" : "General Entry & standard standard cabins"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                    <span>Rooms: {floorRooms.length}</span>
                    <span>•</span>
                    <span>Occupancy: {Math.round((floorRooms.filter(r => r.status === "Occupied").length / floorRooms.length) * 100)}%</span>
                  </div>
                </div>

                {/* Physical Floor Row Map Display */}
                <div className="p-5 overflow-x-auto">
                  <div className="flex items-stretch gap-3.5 min-w-[800px] py-1">
                    {floorRooms.map(room => {
                      const guestName = guests.find(g => g.id === room.assignedGuestId)?.name;
                      const hasActiveAlert = room.cleaningStatus === "Delayed" || room.maintenanceStatus === "Issues Open";

                      return (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`flex-1 text-left p-4 rounded-xl border-t-[4px] border-x border-b shadow-2xs hover:shadow transition duration-150 cursor-pointer flex flex-col justify-between min-h-[140px] text-zinc-950 font-sans outline-none ${
                            room.status === "Available" ? "border-t-emerald-500 border-zinc-200 bg-white hover:bg-emerald-50/10" :
                            room.status === "Occupied" ? "border-t-red-500 border-zinc-200 bg-white hover:bg-rose-50/15" :
                            room.status === "Needs Cleaning" ? "border-t-amber-500 border-zinc-200 bg-white hover:bg-amber-50/20" :
                            room.status === "Reserved" ? "border-t-sky-500 border-zinc-200 bg-white hover:bg-sky-50/15" :
                            "border-t-zinc-400 border-zinc-250 bg-zinc-50/55 hover:bg-zinc-100/60"
                          }`}
                        >
                          {/* Upper Card Title */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-zinc-400">ROOM</span>
                              {hasActiveAlert && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                              )}
                            </div>
                            <h4 className="text-lg font-extrabold tracking-tight text-zinc-900 leading-none">
                              {room.roomNumber}
                            </h4>
                            <span className="text-[9px] font-mono tracking-wider font-semibold uppercase text-zinc-400">
                              {room.roomType}
                            </span>
                          </div>

                          {/* Low Card Status Chip */}
                          <div className="pt-2 mt-2 border-t border-zinc-100/70">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${getStatusDotColorClass(room.status)}`} />
                              <span className="text-[11px] font-medium text-zinc-700 capitalize">
                                {room.status === "Needs Cleaning" ? "Needs Clean" : room.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                              {guestName ? `👉 ${guestName}` : "Vacant Room"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEWPERSPECTIVE 2: COMPACT GRID DISPLAY */}
      {viewMode === "grid" && (
        <div id="grid-view" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map(room => {
            const assignedGuest = guests.find(g => g.id === room.assignedGuestId);
            return (
              <div 
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className="bg-white p-5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition duration-150 cursor-pointer shadow-sm flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-medium text-zinc-400">FLOOR {room.floorNumber}</span>
                      <h3 className="text-xl font-bold tracking-tight text-zinc-900">Room {room.roomNumber}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-sans border ${getStatusColorClass(room.status)}`}>
                      {room.status}
                    </span>
                  </div>

                  {/* Room metadata */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>Room Configuration:</span>
                      <span className="font-semibold text-zinc-800">{room.roomType} Suite</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Housekeeping Standard:</span>
                      <span className={`font-semibold ${
                        room.cleaningStatus === "Clean" ? "text-emerald-600" : "text-amber-500"
                      }`}>{room.cleaningStatus}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Telemetry Sensors:</span>
                      <span className={`font-semibold ${
                        room.maintenanceStatus === "Operational" ? "text-emerald-600" : "text-zinc-600"
                      }`}>{room.maintenanceStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Guest tracking link */}
                <div className="pt-3 border-t border-zinc-150 flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span>{assignedGuest ? assignedGuest.name : "Vacant"}</span>
                  </div>
                  {room.checkOutTime && (
                    <span className="text-[10px] font-mono text-zinc-400">
                      Out: {new Date(room.checkOutTime).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL DRAWER / POPUP OVERLAY */}
      {selectedRoom && (
        <div id="room-drawer-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-end z-50">
          <div className="bg-white h-full max-w-md w-full shadow-2xl overflow-y-auto flex flex-col justify-between animate-slide-in p-6 text-zinc-950 font-sans border-l border-zinc-200">
            
            {/* Upper static block */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">ROOM INTELLIGENCE DISPATCH</span>
                  <h3 className="text-2xl font-black text-zinc-950">Room {selectedRoom.roomNumber}</h3>
                </div>
                <button 
                  onClick={() => setSelectedRoom(null)}
                  className="p-1 px-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded font-bold cursor-pointer transition text-xs"
                >
                  Close
                </button>
              </div>

              {/* Status Pill strip */}
              <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-3.5 rounded-xl border border-zinc-150">
                <div>
                  <span className="text-[9px] font-mono tracking-wider font-semibold uppercase text-zinc-400 block mb-1">FRONTDESK STATE</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${getStatusColorClass(selectedRoom.status)} inline-block`}>
                    {selectedRoom.status}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono tracking-wider font-semibold uppercase text-zinc-400 block mb-1">CLEANING STATE</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${
                    selectedRoom.cleaningStatus === "Clean" ? "bg-emerald-50 text-emerald-700 font-medium" : "bg-amber-50 text-amber-700"
                  } inline-block`}>
                    {selectedRoom.cleaningStatus}
                  </span>
                </div>
              </div>

              {/* Technical indicators */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-zinc-400 mb-2">OPERATIONS SPEC</h4>
                <div className="space-y-2 bg-zinc-50 p-4 rounded-xl text-xs">
                  <div className="flex justify-between border-b border-zinc-100 pb-2">
                    <span className="text-zinc-500">Room Class:</span>
                    <span className="font-semibold text-zinc-800">{selectedRoom.roomType}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-2">
                    <span className="text-zinc-500">Structural Level:</span>
                    <span className="font-semibold text-zinc-800">Floor {selectedRoom.floorNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Service Status:</span>
                    <span className="font-semibold text-zinc-850">{selectedRoom.maintenanceStatus}</span>
                  </div>
                </div>
              </div>

              {/* Guest profiles block */}
              {selectedRoom.assignedGuestId ? (
                (() => {
                  const guest = guests.find(g => g.id === selectedRoom.assignedGuestId);
                  return (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-zinc-400">ASSIGNED RESIDENT</h4>
                      <div className="bg-zinc-900 text-zinc-100 p-4 rounded-xl space-y-3">
                        <div className="flex items-center gap-3">
                          {guest?.digitalIdUrl ? (
                            <img src={guest.digitalIdUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-zinc-700" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-350 flex items-center justify-center font-bold text-xs border border-zinc-700">
                              {guest?.name.split(" ").map(n => n[0]).join("")}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold font-sans text-white leading-none">{guest?.name}</span>
                              {guest?.isVIP && (
                                <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold tracking-wider rounded uppercase px-1 leading-none">VIP</span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block leading-none">{guest?.email}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-zinc-800">
                          <div>
                            <span className="text-zinc-500 font-mono block">CHECK IN</span>
                            <span className="font-medium text-zinc-200">
                              {selectedRoom.checkInTime ? new Date(selectedRoom.checkInTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-mono block">CHECK OUT EXPECTED</span>
                            <span className="font-medium text-zinc-200">
                              {selectedRoom.checkOutTime ? new Date(selectedRoom.checkOutTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-500 flex items-center justify-center gap-1.5">
                  <User className="w-4 h-4 text-zinc-400" />
                  <span>Vacant. No guest assigned.</span>
                </div>
              )}
            </div>

            {/* ACTION FOOTER */}
            <div className="border-t border-zinc-150 pt-5 mt-6 space-y-3 bg-white">
              <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-zinc-450 block">MAPPED QUICK WORKFLOWS</span>
              
              {/* Context Trigger 1: Needs Cleaning / Assign Housekeeping */}
              {selectedRoom.status === "Needs Cleaning" && (
                <form onSubmit={handleHousekeepingSubmit} className="space-y-3 bg-amber-50/40 p-3.5 border border-amber-200/50 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Housekeeper Deployment Queue</span>
                  </span>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-500 block mb-1">SELECT HOUSEKEEPER</label>
                      <select
                        required
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-zinc-250 rounded-lg outline-none text-zinc-800 cursor-pointer"
                      >
                        <option value="">-- Choose housekeeper --</option>
                        {staff.filter(s => s.role === "Housekeeping Staff").map(s => (
                          <option key={s.id} value={s.name}>
                            {s.name} - ({s.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-zinc-500 block mb-1">PRIORITY STATUS</label>
                      <select
                        value={priority}
                        onChange={(e: any) => setPriority(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-zinc-250 rounded-lg outline-none text-zinc-800"
                      >
                        <option value="Low">Low (Routine)</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High (Immediate Turn)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
                    >
                      {submitting ? "Allocating..." : "Dispatch Housekeeper"}
                    </button>
                  </div>
                </form>
              )}

              {/* Context Trigger 2: Checkout guest */}
              {selectedRoom.status === "Occupied" && (
                <button
                  type="button"
                  onClick={executeCheckout}
                  disabled={submitting}
                  className="w-full py-2.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100/70 font-semibold rounded-lg text-xs cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Check-out Resident & Flag Needs Cleaning</span>
                </button>
              )}

              {/* Context Trigger 3: Force Room Available / Cleaning Completed */}
              {(selectedRoom.status === "Needs Cleaning" || selectedRoom.cleaningStatus === "In Progress") && (
                <button
                  type="button"
                  onClick={executeCompleteCleaning}
                  disabled={submitting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Skip/Authorize Swept & Set Clean/Available</span>
                </button>
              )}

              {/* Close Button backdown */}
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition rounded-lg text-xs font-medium cursor-pointer"
              >
                No Action Required
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
