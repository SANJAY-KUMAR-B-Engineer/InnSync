/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Users, 
  Search, 
  ShieldAlert, 
  UserPlus, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  Mail, 
  Phone, 
  History,
  X,
  FileUp,
  Award
} from "lucide-react";
import { Guest } from "../types";

interface GuestsProps {
  guests: Guest[];
  onAddGuest?: (guest: any) => Promise<void>;
}

export default function Guests({
  guests,
  onAddGuest
}: GuestsProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedGuest, setSelectedGuest] = React.useState<Guest | null>(null);
  
  // ID Upload Form mock state
  const [uploading, setUploading] = React.useState(false);
  const [successUpload, setSuccessUpload] = React.useState(false);

  const filteredGuests = guests.filter(g => {
    return (
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.assignedRoom && g.assignedRoom.includes(searchTerm))
    );
  });

  const getPaymentStatusClass = (status: Guest["paymentStatus"]) => {
    switch (status) {
      case "Paid": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Refunded": return "bg-zinc-100 text-zinc-650 border-zinc-200";
      default: return "bg-zinc-50 text-zinc-500 border-zinc-200";
    }
  };

  const executeIDUploadSimulation = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSuccessUpload(true);
      // update local preview
      if (selectedGuest) {
        selectedGuest.digitalIdUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop";
      }
    }, 1500);
  };

  return (
    <div id="guests-view-root" className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-950">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-250 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Resident & Guest Ledger</h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">VIP PROFILES • DIGITAL ID COMPLIANCE • BILLING LOGS</p>
        </div>
      </div>

      {/* Main filter and row layout */}
      <div className="space-y-4">
        
        {/* Search layout */}
        <div className="bg-white border border-zinc-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-3xs">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              placeholder="Search guests by name, email, allocated room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 hover:border-zinc-350 rounded-lg outline-none text-zinc-850"
            />
          </div>
          
          <div className="text-xs text-zinc-505 font-mono uppercase">
            Registered: {guests.length} accounts • VIP: {guests.filter(g => g.isVIP).length} items
          </div>
        </div>

        {/* Double grid structure or side card list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Guest list table board (Column span 2) */}
          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-zinc-150 bg-zinc-50 flex items-center justify-between">
              <span className="text-xs font-bold font-sans text-zinc-850 flex items-center gap-1.5 uppercase">
                <Users className="w-4 h-4 text-zinc-650" />
                <span>ACTIVE GUEST PROFILE BOOK</span>
              </span>
            </div>

            <div className="divide-y divide-zinc-150">
              {filteredGuests.length === 0 ? (
                <div className="p-12 text-center text-zinc-400">
                  <p className="text-xs">No guest profiles matches query.</p>
                </div>
              ) : (
                filteredGuests.map(guest => (
                  <div 
                    key={guest.id}
                    onClick={() => {
                      setSelectedGuest(guest);
                      setSuccessUpload(false);
                    }}
                    className={`p-4 hover:bg-zinc-50/50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      selectedGuest?.id === guest.id ? "bg-zinc-50" : ""
                    }`}
                  >
                    {/* Guest details row */}
                    <div className="flex items-center gap-3">
                      {guest.digitalIdUrl ? (
                        <img 
                          src={guest.digitalIdUrl} 
                          alt={guest.name} 
                          className="w-9 h-9 rounded-full object-cover border border-zinc-200 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-500 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {guest.name.split(" ").map(n => n[0]).join("")}
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-900">{guest.name}</span>
                          {guest.isVIP && (
                            <span className="bg-amber-100 text-amber-800 border border-amber-200/50 font-bold tracking-wider rounded uppercase px-1 py-0.2 text-[8px] flex items-center gap-0.5">
                              <Award className="w-2 h-2 text-amber-650" />
                              <span>VIP</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono block break-all">{guest.email} • {guest.phone}</span>
                      </div>
                    </div>

                    {/* Room and booking states indicators */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        guest.status === "CheckedIn" ? "bg-emerald-50 text-emerald-700" :
                        guest.status === "Reserved" ? "bg-sky-50 text-sky-700" : "bg-zinc-100 text-zinc-550"
                      }`}>
                        {guest.status === "CheckedIn" ? `Room ${guest.assignedRoom}` : guest.status}
                      </span>
                      
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-semibold inline-block ${getPaymentStatusClass(guest.paymentStatus)}`}>
                        {guest.paymentStatus}
                      </span>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right side: Detail visual of selected guest with document verification */}
          <div className="space-y-4">
            {selectedGuest ? (
              <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm text-zinc-950 font-sans">
                <div className="border-b border-zinc-150 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400">LEDGER PROFILE LOCK</span>
                    <h3 className="text-sm font-bold text-zinc-900 leading-none">{selectedGuest.name}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedGuest(null)}
                    className="text-zinc-400 hover:text-zinc-650 text-xs font-bold transition cursor-pointer"
                  >
                    Clear Focus
                  </button>
                </div>

                {/* Sub details */}
                <div className="space-y-2.5 text-xs text-zinc-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{selectedGuest.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{selectedGuest.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Resident History: <b className="text-zinc-800 font-semibold">{selectedGuest.historyCount} previous check-ins</b></span>
                  </div>
                </div>

                {/* Micro Document scan simulation panel */}
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Digital ID Compliance Scan</span>
                  </span>

                  {selectedGuest.digitalIdUrl || successUpload ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-[11px] font-medium">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Goverment Identity Verified Map</span>
                      </div>
                      
                      <div className="h-28 rounded-lg overflow-hidden border border-zinc-200 relative bg-zinc-900">
                        <img 
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop" 
                          alt="Government Scan" 
                          className="object-cover w-full h-full opacity-70"
                          referrerPolicy="no-referrer" 
                        />
                        <div className="absolute top-2 left-2 bg-emerald-600 text-[8px] font-semibold text-white px-1.5 py-0.5 rounded uppercase">
                          PASS: USA Driver License
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-[11px] text-zinc-500 leading-normal">
                        Verify photo document credentials on file to complete compliance with municipal luxury lodging rules.
                      </p>

                      <button
                        type="button"
                        disabled={uploading}
                        onClick={executeIDUploadSimulation}
                        className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        <span>{uploading ? "Verifying Passport OCR..." : "Simulate ID Scanned Verification"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Bill preview sheet */}
                <div className="bg-zinc-900 text-zinc-100 p-4 rounded-xl space-y-2.5">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">FOLIO ACCOUNT STATUS</span>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Nights Allocated:</span>
                    <span>3 Nights</span>
                  </div>
                  <div className="flex justify-between text-xs pb-1.5 border-b border-zinc-850">
                    <span className="text-zinc-400">Total Charged:</span>
                    <span>₹642.00</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-400">Ledger Statement:</span>
                    <span className={selectedGuest.paymentStatus === "Paid" ? "text-emerald-400" : "text-amber-400"}>
                      {selectedGuest.paymentStatus}
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 border border-zinc-200 rounded-xl text-center text-zinc-400 bg-white">
                <Users className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                <p className="text-xs">Click any guest card on the list to display comprehensive digital ID scans and transaction histories.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
