/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend, 
  Cell, 
  PieChart, 
  Pie 
} from "recharts";
import { 
  TrendingUp, 
  Coins, 
  Hotel, 
  Activity, 
  Utensils, 
  HardHat, 
  Compass, 
  Sparkles,
  Download
} from "lucide-react";
import { Room, MaintenanceTicket, HotelAnalytics } from "../types";

interface AnalyticsProps {
  analytics: HotelAnalytics;
  rooms: Room[];
}

export default function Analytics({
  analytics,
  rooms
}: AnalyticsProps) {

  // Pie chart theme palette colors represent classic premium Slate-emerald pairing
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#71717a", "#18181b"];

  // Calculate room distribution metrics
  const standardCount = rooms.filter(r => r.roomType === "Standard").length;
  const deluxeCount = rooms.filter(r => r.roomType === "Deluxe").length;
  const suiteCount = rooms.filter(r => r.roomType === "Suite").length;
  const penthouseCount = rooms.filter(r => r.roomType === "Penthouse").length;

  const roomTypeDistribution = [
    { name: "Standard Rooms", value: standardCount },
    { name: "Deluxe Wing", value: deluxeCount },
    { name: "Superior Executive Suites", value: suiteCount },
    { name: "Penthouses", value: penthouseCount }
  ];

  return (
    <div id="analytics-view-root" className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-950">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-250 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Operations & Financial Analytics</h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">REVENUE INSIGHTS • ROOM ALLOCATION COMPRESSIONS • COOPERATIVE TURN TIMES</p>
        </div>
        <button
          onClick={() => alert("Report Export: Commencing PDF render pipeline on client browser. Finalizing download...")}
          className="flex items-center gap-1 px-3.5 py-2 bg-white border border-zinc-250 hover:bg-zinc-50 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition"
        >
          <Download className="w-3.5 h-3.5 text-zinc-500" />
          <span>Export Executive Sheet</span>
        </button>
      </div>

      {/* Bento Grid: Upper micro statistics blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* RevPAR Metre */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-3xs space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono tracking-wider font-semibold uppercase">Revenue per Available Room (RevPAR)</span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900">₹154.20</h3>
          <p className="text-[10px] text-zinc-500">Exceeds Seattle luxury baseline target by 4.8%</p>
        </div>

        {/* ARR Average rate */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-3xs space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono tracking-wider font-semibold uppercase">Average Daily Rate (ADR)</span>
            <Compass className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900">₹214.50</h3>
          <p className="text-[10px] text-zinc-500">Driven by Penthouse high-demand weekends</p>
        </div>

        {/* Cleaning Efficiency speed */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-3xs space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono tracking-wider font-semibold uppercase">Sanitation turn rate average</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900">26.5 mins</h3>
          <p className="text-[10px] text-zinc-400">Target sweep limit: under 30:00 mins</p>
        </div>

      </div>

      {/* Visual Recharts blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Occupancy trends (Area chart) */}
        <div className="bg-white p-5 border border-zinc-200 rounded-xl space-y-4 shadow-2xs">
          <div>
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Occupancy Performance Interval</h4>
            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">7-DAY HISTORIC ROLLING CAPACITY RATIOS</p>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.occupancyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} fontStyle="italic" />
                <YAxis stroke="#94a3b8" fontSize={9} domain={[50, 100]} />
                <Tooltip contentStyle={{ background: "#18181b", border: "0", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                <Area type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOcc)" name="Occupancy %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Daily Revenue levels (Bar chart) */}
        <div className="bg-white p-5 border border-zinc-200 rounded-xl space-y-4 shadow-2xs">
          <div>
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Daily Giga-Folio Revenue Levels</h4>
            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">NET DAILY TRANSFERS AND SETTLEMENTS</p>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.revenueTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ background: "#18181b", border: "0", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Settled ₹">
                  {analytics.revenueTrend.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? "#10b981" : "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Room Type Utilization (Pie visualization) */}
        <div className="bg-white p-5 border border-zinc-200 rounded-xl space-y-4 shadow-2xs">
          <div>
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Lodging Inventory Distribution</h4>
            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">PHYSICAL RATIO DISTRIBUTION BY MODEL CLASS</p>
          </div>

          <div className="h-64 flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
            <div className="h-48 w-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomTypeDistribution}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {roomTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-mono font-black text-zinc-900">{rooms.length}</span>
                <span className="text-[9px] text-zinc-400 uppercase tracking-tight">Total Units</span>
              </div>
            </div>

            {/* Legend block display */}
            <div className="space-y-2 text-xs">
              {roomTypeDistribution.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-zinc-650 font-sans">{entry.name}: <b className="text-zinc-900 font-bold">{entry.value} rooms</b></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 4: Maintenance distribution cost ratio */}
        <div className="bg-white p-5 border border-zinc-200 rounded-xl space-y-4 shadow-2xs">
          <div>
            <h4 className="text-xs font-bold text-zinc-805 uppercase tracking-wider">Facility Maintenance Cost Share</h4>
            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">SUBSECTION COST SEGREGATIONS IN RUPEES</p>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={analytics.maintenanceCostBySystem} 
                layout="vertical" 
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                <YAxis dataKey="system" type="category" stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ background: "#18181b", border: "0", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                <Bar dataKey="cost" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Repair Cost (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
