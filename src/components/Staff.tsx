/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Smile, 
  Star, 
  Award, 
  TrendingUp, 
  CheckCircle,
  Radio,
  CheckSquare
} from "lucide-react";
import { StaffMember } from "../types";

interface StaffProps {
  staff: StaffMember[];
}

export default function Staff({
  staff
}: StaffProps) {
  
  const getRoleBadgeClass = (role: StaffMember["role"]) => {
    switch (role) {
      case "Super Admin": return "bg-rose-50 text-rose-700 border-rose-200";
      case "Hotel Manager": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Receptionist": return "bg-purple-50 text-purple-700 border-purple-200";
      case "Housekeeping Staff": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Technician": return "bg-sky-50 text-sky-700 border-sky-200";
      default: return "bg-zinc-50 text-zinc-650 border-zinc-200";
    }
  };

  const getStatusDotColor = (status: StaffMember["status"]) => {
    switch (status) {
      case "On Duty": return "bg-emerald-500 animate-pulse";
      case "On Break": return "bg-amber-500";
      case "Off Duty": return "bg-zinc-400";
      default: return "bg-zinc-300";
    }
  };

  return (
    <div id="staff-view-root" className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-950">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-250 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Task Force & Staffing</h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">ROLE SCHEDULES • SHIFT TIME CARD CLOCKS • TURN KPIs</p>
        </div>
      </div>

      {/* Grid statistics metrics for staff */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* KPI: Staff on duty */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-zinc-400 block uppercase">Clocks Active</span>
            <span className="text-2xl font-black text-zinc-900">{staff.filter(s => s.status === "On Duty").length} / {staff.length}</span>
            <p className="text-[10px] text-zinc-500 mt-0.5">Employees on current roster shifts</p>
          </div>
          <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* KPI: Tasks Completed metrics */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-zinc-400 block uppercase">Completed Swipes</span>
            <span className="text-2xl font-black text-zinc-900">387 checks</span>
            <p className="text-[10px] text-zinc-500 mt-0.5">Housekeeping & Tech fixes this month</p>
          </div>
          <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Team Satisfaction */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-zinc-400 block uppercase">AQS Team Rating</span>
            <span className="text-2xl font-black text-zinc-900">4.8 / 5.0</span>
            <p className="text-[10px] text-zinc-500 mt-0.5">Average checkout surveys feedback</p>
          </div>
          <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
            <Star className="w-5 h-5 fill-current" />
          </div>
        </div>

      </div>

      {/* Primary Staff grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map(member => (
          <div key={member.id} className="bg-white p-5 rounded-xl border border-zinc-205 flex flex-col justify-between gap-4 shadow-sm hover:border-zinc-300 transition duration-150">
            
            <div className="space-y-3">
              {/* Header profile */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{member.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-wide uppercase border font-semibold mt-1 inline-block ${getRoleBadgeClass(member.role)}`}>
                    {member.role}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(member.status)}`} />
                  <span className="text-[10px] font-mono tracking-wider font-semibold uppercase text-zinc-500">
                    {member.status}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 text-xs border-t border-zinc-100 pt-3">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Active Shift Interval:</span>
                  </span>
                  <span className="font-semibold text-zinc-800 font-mono text-[11px]">{member.shiftTiming}</span>
                </div>

                <div className="flex items-center justify-between text-zinc-500">
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Assigned Tasks Queue:</span>
                  </span>
                  <span className="font-semibold text-zinc-850 font-mono">{member.assignedTasksCount} dispatch cycles</span>
                </div>

                <div className="flex items-center justify-between text-zinc-500">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Completion index:</span>
                  </span>
                  <span className="font-semibold text-emerald-600 font-mono">
                    {member.name === "Maria Gonzales" ? "98.2%" : member.name === "Sylvia Chen" ? "99.4%" : "96.5%"}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance footprint footer */}
            <div className="pt-3.5 border-t border-zinc-150 flex items-center justify-between text-xs text-zinc-500">
              <span className="text-[9px] uppercase font-mono tracking-widest bg-zinc-50 px-2 py-0.5 rounded">
                Roster: {member.id}
              </span>
              <div className="flex items-center gap-0.5 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-semibold text-zinc-800">{member.rating} stars rating</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
