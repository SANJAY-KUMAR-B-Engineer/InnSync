/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Sparkles, 
  Clock, 
  UserCheck, 
  QrCode, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  User, 
  Camera,
  X,
  FileImage,
  RefreshCw
} from "lucide-react";
import { Room, StaffMember } from "../types";

interface HousekeepingProps {
  rooms: Room[];
  staff: StaffMember[];
  onCompleteCleaning: (roomId: string) => Promise<void>;
  onAssignHousekeeping: (roomId: string, staffName: string, priority: string) => Promise<void>;
  onAddTicket: (ticket: any) => Promise<void>;
}

export default function Housekeeping({
  rooms,
  staff,
  onCompleteCleaning,
  onAssignHousekeeping,
  onAddTicket
}: HousekeepingProps) {
  // Search state
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Custom timer simulation tick state
  const [ticker, setTicker] = React.useState(0);

  // QR Scan simulator state
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [scannedRoomNo, setScannedRoomNo] = React.useState("");
  const [scanResultRoom, setScanResultRoom] = React.useState<Room | null>(null);

  // Photo upload simulation state
  const [selectedRoomForIssue, setSelectedRoomForIssue] = React.useState<Room | null>(null);
  const [photoIssueText, setPhotoIssueText] = React.useState("");
  const [photoSystem, setPhotoSystem] = React.useState<"AC" | "Plumbing" | "Electricity" | "WiFi" | "Water Leakage" | "Emergency">("Plumbing");
  const [submittingPhotoIssue, setSubmittingPhotoIssue] = React.useState(false);

  // Periodic interval tick to update live stopwatch timers
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTicker(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getCleaningTimerText = (room: Room) => {
    if (!room.cleaningTimeStart) return "00:00";
    const startTime = new Date(room.cleaningTimeStart).getTime();
    const elapsedMs = Date.now() - startTime;
    const elapsedSecs = Math.max(0, Math.floor(elapsedMs / 1000));
    const mins = Math.floor(elapsedSecs / 60);
    const secs = elapsedSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getElapsedTimeInSeconds = (room: Room) => {
    if (!room.cleaningTimeStart) return 0;
    const startTime = new Date(room.cleaningTimeStart).getTime();
    return Math.floor((Date.now() - startTime) / 1000);
  };

  // Filter tasks
  const pendingCleaningRooms = rooms.filter(room => {
    const isPending = room.status === "Needs Cleaning" || room.cleaningStatus === "In Progress" || room.cleaningStatus === "Delayed";
    const matchesSearch = room.roomNumber.includes(searchTerm) || room.roomType.toLowerCase().includes(searchTerm.toLowerCase());
    return isPending && matchesSearch;
  });

  const handleQRScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedRoomNo) return;
    const matchedRoom = rooms.find(r => r.roomNumber === scannedRoomNo);
    if (matchedRoom) {
      setScanResultRoom(matchedRoom);
    } else {
      alert("Verification Failed: Room physical door plate key signature index invalid.");
    }
  };

  const executeQRComplete = async () => {
    if (!scanResultRoom) return;
    try {
      await onCompleteCleaning(scanResultRoom.id);
      setShowQRModal(false);
      setScannedRoomNo("");
      setScanResultRoom(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForIssue || !photoIssueText) return;
    setSubmittingPhotoIssue(true);
    try {
      // Create a maintenance ticket with a simulated photo url!
      await onAddTicket({
        system: photoSystem,
        roomNumber: selectedRoomForIssue.roomNumber,
        issue: `[Housekeeper Audit Alert] ${photoIssueText}`,
        priority: "High",
        assignedTechnician: photoSystem === "AC" || photoSystem === "Plumbing" ? "Marcus Vance" : "Sylvia Chen"
      });
      setSelectedRoomForIssue(null);
      setPhotoIssueText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPhotoIssue(false);
    }
  };

  // Housekeeping staff statistics
  const housekeepers = staff.filter(s => s.role === "Housekeeping Staff");

  return (
    <div id="housekeeping-view-root" className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-950">
      
      {/* Header section with QR launch button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-250 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Housekeeping Control Queue</h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">LIVE TIMER STOPWATCHES • TURN TIMES • SCAN MOUNT WORKFLOWS</p>
        </div>
        <button
          id="launch-qr-scanner-btn"
          onClick={() => setShowQRModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition"
        >
          <QrCode className="w-4 h-4" />
          <span>Launch QR Code Room Scanner</span>
        </button>
      </div>

      {/* Grid: Split into active tasks and housekeeper performance stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Active tasks listing (Column span 2) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search filter banner */}
          <div className="bg-white border border-zinc-200 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                placeholder="Search pending laundry, standard beds, suites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-lg outline-none text-zinc-850"
              />
            </div>
            
            <div className="text-xs text-zinc-500 font-mono hidden md:block">
              ACTIVE QUEUE: {pendingCleaningRooms.length} TASKS
            </div>
          </div>

          {/* List queue card */}
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-zinc-50 px-5 py-4 border-b border-zinc-150 flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span>Duty Room Registry</span>
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>LIVE FEED</span>
              </span>
            </div>

            <div className="divide-y divide-zinc-150">
              {pendingCleaningRooms.length === 0 ? (
                <div className="p-12 text-center text-zinc-400">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-zinc-700">All Rooms Swept & Clean</p>
                  <p className="text-xs mt-0.5">Hotel floor maps reflect pristine sanitation.</p>
                </div>
              ) : (
                pendingCleaningRooms.map(room => {
                  const isCleaningStarted = !!room.cleaningTimeStart;
                  const elapsedSecs = getElapsedTimeInSeconds(room);
                  const isDelayed = elapsedSecs > 900; // 15 mins turn timeout simulation

                  return (
                    <div key={room.id} className="p-5 hover:bg-zinc-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Left Block description */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-zinc-900">Room {room.roomNumber}</span>
                          <span className="bg-zinc-100 text-zinc-650 px-2 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase">
                            {room.roomType}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase font-bold ${
                            room.cleaningPriority === "High" ? "bg-red-50 text-red-600 border border-red-200" :
                            room.cleaningPriority === "Medium" ? "bg-amber-50 text-amber-700" : "bg-zinc-150 text-zinc-500"
                          }`}>
                            {room.cleaningPriority} Priority
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Housekeeping Assigned: <b className="text-zinc-700 font-semibold">{isCleaningStarted ? "Maria Gonzales" : "Queue Open"}</b></span>
                          </span>
                        </div>
                      </div>

                      {/* Timer & action trigger block */}
                      <div className="flex items-center gap-3.5 justify-between md:justify-end flex-shrink-0">
                        
                        {/* Clean active timer stopwatch */}
                        {isCleaningStarted ? (
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono ${
                            isDelayed ? "bg-rose-50 border-rose-200 text-rose-700 animate-pulse" : "bg-emerald-50 border-emerald-150 text-emerald-700"
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold font-mono">{getCleaningTimerText(room)}</span>
                            {isDelayed && (
                              <span className="text-[8px] bg-rose-200 text-rose-800 px-1 rounded uppercase font-sans font-black">DELAYED</span>
                            )}
                          </div>
                        ) : (
                          <div className="text-[10px] text-zinc-400 font-mono italic flex items-center gap-1 bg-zinc-50 border border-zinc-200 px-2.5 py-1.5 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-zinc-300" />
                            <span>Awaiting Starters</span>
                          </div>
                        )}

                        {/* Button control triggers */}
                        <div className="flex items-center gap-2">
                          {isCleaningStarted ? (
                            <>
                              <button
                                onClick={() => onCompleteCleaning(room.id)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition shadow-xs"
                              >
                                Complete Room & Release
                              </button>
                              
                              {/* Housekeeper reports faulty equipment immediately from cleaning room */}
                              <button
                                title="Report Room Issue"
                                onClick={() => setSelectedRoomForIssue(room)}
                                className="p-1 px-2.5 bg-white border border-zinc-250 hover:bg-zinc-100 text-zinc-500 rounded-lg cursor-pointer"
                              >
                                <Camera className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => onAssignHousekeeping(room.id, "Maria Gonzales", "Medium")}
                              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition"
                            >
                              Start Stopwatch
                            </button>
                          )}
                        </div>

                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right side: performance charts and scanning simulators instructions */}
        <div className="space-y-4">
          
          {/* QR Guide instruction card */}
          <div className="bg-zinc-900 text-white p-5 rounded-xl border border-zinc-850 space-y-3 shadow-xs">
            <span className="text-[9px] font-mono tracking-wider font-extrabold uppercase text-purple-400 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5" />
              <span>Smart QR System Workflow</span>
            </span>
            <h4 className="text-sm font-bold text-zinc-100">Housekeeper QR Door Walk</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Each door lock features a secure physical QR signature tag. Housekeepers scan upon entering/finishing a standard sweep to:
            </p>
            <ul className="text-[11px] text-zinc-350 space-y-1.5 list-disc list-inside">
              <li>Log immediate GPS sweep start clocks</li>
              <li>Acknowledge high priority turn schedules</li>
              <li>Instantly release rooms clean to FrontDesk without phone check loops</li>
            </ul>
            <button
              onClick={() => setShowQRModal(true)}
              className="w-full mt-2.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg cursor-pointer shadow-sm text-center"
            >
              Simulate Door Sweep Scan
            </button>
          </div>

          {/* Housekeeping staff stats listing */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Sanitation Performance Team</span>
            </h4>
            
            <div className="space-y-3 text-xs">
              {housekeepers.map(h => (
                <div key={h.id} className="bg-zinc-50 p-3 rounded-lg border border-zinc-150 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-zinc-900 block">{h.name}</span>
                    <span className={`text-[9px] font-mono uppercase ${
                      h.status === "On Duty" ? "text-emerald-500" : "text-zinc-400"
                    }`}>{h.status} • SHIFT: {h.shiftTiming}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-zinc-850 font-bold block">
                      {h.name === "Maria Gonzales" ? "24 mins avg" : "29 mins avg"}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">{h.completedTasksCount} room audits</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* DETECTOR 1: SIMULATOR QR MODAL */}
      {showQRModal && (
        <div id="qr-modal-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-zinc-200 max-w-sm w-full shadow-2xl overflow-hidden font-sans text-zinc-950">
            <div className="px-5 py-4 bg-zinc-50 border-b border-zinc-150 flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-850 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-purple-600" />
                <span>QR Code Plate Simulator</span>
              </span>
              <button 
                onClick={() => {
                  setShowQRModal(false);
                  setScannedRoomNo("");
                  setScanResultRoom(null);
                }}
                className="text-zinc-400 hover:text-zinc-650 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* QR Scanner visual mockup */}
              <div className="w-40 h-40 bg-zinc-900 rounded-xl mx-auto flex flex-col items-center justify-center p-4 border border-zinc-850 relative">
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-purple-400" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-purple-400" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-purple-400" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-purple-400" />
                
                <QrCode className="w-16 h-16 text-purple-300 animate-pulse" />
                <span className="text-[9px] font-mono text-zinc-500 mt-2">ALIGNED QR FRAME</span>
              </div>

              {!scanResultRoom ? (
                <form onSubmit={handleQRScanSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 block">TYPE PHYSICAL DOOR NUMBER</label>
                    <input
                      required
                      placeholder="e.g. 103 or 205 (Checkout complete rooms)"
                      value={scannedRoomNo}
                      onChange={(e) => setScannedRoomNo(e.target.value)}
                      className="w-full text-xs p-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg outline-none text-zinc-850"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg cursor-pointer"
                  >
                    Simulate Camera Scanner Lock
                  </button>
                </form>
              ) : (
                <div className="space-y-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] text-purple-600 font-mono font-bold block uppercase">PLATE SCAN VALIDATED</span>
                    <h5 className="text-lg font-black text-zinc-900">Room {scanResultRoom.roomNumber}</h5>
                    <p className="text-[11px] text-zinc-500">Current Status: <b className="font-semibold text-zinc-800">{scanResultRoom.status}</b></p>
                  </div>

                  <button
                    type="button"
                    onClick={executeQRComplete}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg cursor-pointer"
                  >
                    Set Clean & Transition to Available
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* DETECTOR 2: PHOTO ISSUE MODAL */}
      {selectedRoomForIssue && (
        <div id="photo-modal-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-zinc-200 max-w-sm w-full shadow-2xl overflow-hidden font-sans text-zinc-950">
            <div className="px-5 py-4 bg-zinc-50 border-b border-zinc-150 flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-850 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-500" />
                <span>Upload Issue Photo (Room {selectedRoomForIssue.roomNumber})</span>
              </span>
              <button 
                onClick={() => setSelectedRoomForIssue(null)}
                className="text-zinc-400 hover:text-zinc-650 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePhotoIssueSubmit} className="p-5 space-y-4">
              <div className="w-full p-6 border-2 border-dashed border-zinc-200 hover:border-zinc-300 rounded-xl flex flex-col items-center justify-center text-center bg-zinc-50">
                <FileImage className="w-10 h-10 text-zinc-400 mb-2" />
                <span className="text-xs font-semibold text-zinc-800">Clog_corridor_leak_photo.jpg</span>
                <span className="text-[10px] text-zinc-400">Mock compression succeeded (84 KB)</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 block">AFFECTED APPARATUS</label>
                <select
                  value={photoSystem}
                  onChange={(e: any) => setPhotoSystem(e.target.value)}
                  className="w-full text-xs p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 outline-none"
                >
                  <option value="Plumbing">Plumbing Leakage</option>
                  <option value="AC">AC Compressor</option>
                  <option value="Electricity">Electricity Lamp</option>
                  <option value="WiFi">WiFi Box</option>
                  <option value="Emergency">Extreme Emergency</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 block">EXPLANATION FOR DISPATCH</label>
                <input
                  required
                  placeholder="e.g. Toilet tank over-filling valve makes continuous leaking"
                  value={photoIssueText}
                  onChange={(e) => setPhotoIssueText(e.target.value)}
                  className="w-full text-xs p-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none text-zinc-800"
                />
              </div>

              <button
                type="submit"
                disabled={submittingPhotoIssue}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg cursor-pointer"
              >
                {submittingPhotoIssue ? "Filing Ticket..." : "Post Photo Alert To Tech Dispatch"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
