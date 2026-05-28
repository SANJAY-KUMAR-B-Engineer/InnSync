/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

import { Room, MaintenanceTicket, Guest, StaffMember, HotelNotification, HotelAnalytics } from "./src/types";
import { INITIAL_ROOMS, INITIAL_TICKETS, INITIAL_GUESTS, INITIAL_STAFF, INITIAL_NOTIFICATIONS, INITIAL_ANALYTICS } from "./src/data";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Central In-Memory State of the Smart Hotel
let dbRooms: Room[] = [...INITIAL_ROOMS];
let dbTickets: MaintenanceTicket[] = [...INITIAL_TICKETS];
let dbGuests: Guest[] = [...INITIAL_GUESTS];
let dbStaff: StaffMember[] = [...INITIAL_STAFF];
let dbNotifications: HotelNotification[] = [...INITIAL_NOTIFICATIONS];
let dbAnalytics: HotelAnalytics = { ...INITIAL_ANALYTICS };

// Lazy-initialized Gemini Client to prevent crash when GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Recalculates high-level metrics dynamically from Room and Ticket tables
function updateScoresAndAnalytics() {
  const totalRooms = dbRooms.length;
  const occupiedCount = dbRooms.filter(r => r.status === "Occupied").length;
  const maintenanceCount = dbRooms.filter(r => r.status === "Maintenance" || r.maintenanceStatus === "Issues Open").length;
  const cleaningCount = dbRooms.filter(r => r.status === "Needs Cleaning" || r.cleaningStatus === "In Progress" || r.cleaningStatus === "Delayed").length;

  const occupancyRate = Math.round((occupiedCount / totalRooms) * 100);
  const activeComplaints = dbTickets.filter(t => t.status !== "Resolved").length;

  // Real-time Health scoring: affected by issues, overdue tasks, or broken tech
  let healthScore = 100;
  healthScore -= (activeComplaints * 3); // -3% per open ticket
  healthScore -= (cleaningCount * 2); // -2% per uncleaned room
  healthScore -= (maintenanceCount * 4); // -4% per out-of-order room
  if (healthScore < 40) healthScore = 40;

  dbAnalytics.occupancyRate = occupancyRate;
  dbAnalytics.activeComplaints = activeComplaints;
  dbAnalytics.operationalHealthScore = Math.min(100, Math.round(healthScore));
}

// ----------------------------------------------------
// API Route Handlers
// ----------------------------------------------------

// Get complete hotel state
app.get("/api/hotel/state", (req, res) => {
  updateScoresAndAnalytics();
  res.json({
    rooms: dbRooms,
    tickets: dbTickets,
    guests: dbGuests,
    staff: dbStaff,
    notifications: dbNotifications,
    analytics: dbAnalytics,
  });
});

// Update Room Status directly
app.post("/api/hotel/room/status", (req, res) => {
  const { roomId, status, cleaningStatus, maintenanceStatus } = req.body;
  const room = dbRooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  if (status !== undefined) room.status = status;
  if (cleaningStatus !== undefined) room.cleaningStatus = cleaningStatus;
  if (maintenanceStatus !== undefined) room.maintenanceStatus = maintenanceStatus;

  // Auto clean timer reset if changed to standard clean
  if (cleaningStatus === "Clean") {
    room.cleaningTimeStart = null;
    room.cleaningElapsedSeconds = 0;
  }

  updateScoresAndAnalytics();
  res.json({ success: true, room });
});

// Check-in workflow: Occupy room
app.post("/api/hotel/checkin", (req, res) => {
  const { guestId, roomId } = req.body;
  const room = dbRooms.find(r => r.id === roomId);
  const guest = dbGuests.find(g => g.id === guestId);

  if (!room || !guest) {
    return res.status(404).json({ error: "Room or guest not found" });
  }

  // Room status -> Occupied
  room.status = "Occupied";
  room.assignedGuestId = guest.id;
  room.checkInTime = new Date().toISOString();
  room.checkOutTime = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(); // 3 days default ahead

  // Guest status -> CheckedIn
  guest.status = "CheckedIn";
  guest.assignedRoom = room.roomNumber;

  // Add confirmation notification
  const newNotif: HotelNotification = {
    id: `notif-${Date.now()}`,
    title: "Check-in Successful",
    message: `Guest ${guest.name} checking into Room ${room.roomNumber} updated successfully.`,
    type: "success",
    timestamp: new Date().toISOString(),
    read: false
  };
  dbNotifications.unshift(newNotif);

  updateScoresAndAnalytics();
  res.json({ success: true, room, guest });
});

// Checkout Completed -> Room status automaticaly changes to "Needs Cleaning"
app.post("/api/hotel/checkout", (req, res) => {
  const { roomId } = req.body;
  const room = dbRooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  const guestId = room.assignedGuestId;
  if (guestId) {
    const guest = dbGuests.find(g => g.id === guestId);
    if (guest) {
      guest.status = "CheckedOut";
      guest.assignedRoom = null;
    }
  }

  // Set state transition
  room.status = "Needs Cleaning";
  room.cleaningStatus = "Needs Cleaning";
  room.assignedGuestId = null;
  room.checkInTime = null;
  room.checkOutTime = null;

  // Staff completes checklist, housekeeper automatically gets an info alert
  const newNotif: HotelNotification = {
    id: `notif-${Date.now()}`,
    title: `Room ${room.roomNumber} Checked Out`,
    message: `Checkout completed. Room priority turned High. Dispatched queue for housekeepers.`,
    type: "warning",
    timestamp: new Date().toISOString(),
    read: false
  };
  dbNotifications.unshift(newNotif);

  updateScoresAndAnalytics();
  res.json({ success: true, room });
});

// Housekeeping assignment and action timers
app.post("/api/hotel/housekeeping/assign", (req, res) => {
  const { roomId, staffName, priority } = req.body;
  const room = dbRooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  room.cleaningStatus = "In Progress";
  room.cleaningPriority = priority || "Medium";
  room.cleaningTimeStart = new Date().toISOString();

  // Update staff member assignments
  if (staffName) {
    const staff = dbStaff.find(s => s.name === staffName);
    if (staff) {
      staff.assignedTasksCount += 1;
    }
  }

  updateScoresAndAnalytics();
  res.json({ success: true, room });
});

// Housekeeping Completed -> Room status changes to "Available"
app.post("/api/hotel/housekeeping/complete", (req, res) => {
  const { roomId } = req.body;
  const room = dbRooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  room.status = "Available";
  room.cleaningStatus = "Clean";
  room.cleaningTimeStart = null;
  room.cleaningElapsedSeconds = 0;

  // Add notification
  const newNotif: HotelNotification = {
    id: `notif-${Date.now()}`,
    title: "Cleaning Complete Room " + room.roomNumber,
    message: `Staff finalized cleaning audit. Status is set to Available.`,
    type: "success",
    timestamp: new Date().toISOString(),
    read: false
  };
  dbNotifications.unshift(newNotif);

  updateScoresAndAnalytics();
  res.json({ success: true, room });
});

// Create Maintenance Issue Ticket
app.post("/api/hotel/tickets/add", (req, res) => {
  const { system, roomNumber, issue, priority, assignedTechnician, isPredictive } = req.body;

  const newTicket: MaintenanceTicket = {
    id: `ticket-${Date.now()}`,
    system: system || "AC",
    roomNumber: roomNumber || null,
    issue: issue || "Telemetry Warning",
    priority: priority || "Medium",
    assignedTechnician: assignedTechnician || "Staff Technician",
    status: "Open",
    notes: "Ticket created via operations console.",
    creationTime: new Date().toISOString(),
    completionTime: null,
    photoUrl: null,
    isPredictive: !!isPredictive
  };

  dbTickets.unshift(newTicket);

  // If issue is tied to a specific room, update room's maintenance state
  if (roomNumber) {
    const room = dbRooms.find(r => r.roomNumber === roomNumber);
    if (room) {
      room.status = "Maintenance";
      room.maintenanceStatus = "Issues Open";
    }
  }

  // Trigger alert
  const newNotif: HotelNotification = {
    id: `notif-${Date.now()}`,
    title: `Maintenance dispatch: ${system}`,
    message: `Issue logged in ${roomNumber ? 'Room ' + roomNumber : 'Common Area'}. High priority.`,
    type: priority === "Emergency" || priority === "High" ? "danger" : "warning",
    timestamp: new Date().toISOString(),
    read: false
  };
  dbNotifications.unshift(newNotif);

  updateScoresAndAnalytics();
  res.json({ success: true, ticket: newTicket });
});

// Update Maintenance ticket details / Actions
app.post("/api/hotel/tickets/update", (req, res) => {
  const { ticketId, status, notes, completionTime } = req.body;
  const ticket = dbTickets.find(t => t.id === ticketId);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  if (status !== undefined) ticket.status = status;
  if (notes !== undefined) ticket.notes = notes;
  if (completionTime !== undefined) ticket.completionTime = completionTime;

  if (status === "Resolved") {
    ticket.completionTime = new Date().toISOString();
    // If room block exists, see if other tickets exist
    if (ticket.roomNumber) {
      const activeRoomTicketsCount = dbTickets.filter(t => t.roomNumber === ticket.roomNumber && t.status !== "Resolved").length;
      if (activeRoomTicketsCount === 0) {
        const room = dbRooms.find(r => r.roomNumber === ticket.roomNumber);
        if (room) {
          room.status = "Available"; // Clear block
          room.maintenanceStatus = "Operational";
        }
      }
    }
  }

  updateScoresAndAnalytics();
  res.json({ success: true, ticket });
});

// Dismiss notification
app.post("/api/hotel/notifications/dismiss", (req, res) => {
  const { notifId } = req.body;
  const notif = dbNotifications.find(n => n.id === notifId);
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true });
});

// Clear all notifications
app.post("/api/hotel/notifications/clear-all", (req, res) => {
  dbNotifications = dbNotifications.map(n => ({ ...n, read: true }));
  res.json({ success: true });
});

// Dynamic AI Revenue Pricing and Premium Upselling Optimizer
app.post("/api/hotel/revenue/optimize", async (req, res) => {
  const client = getGeminiClient();
  
  // Count available suites and arrivals
  const availableSuites = dbRooms.filter(r => r.status === "Available" && r.roomType === "Suite").length;
  const arrivalsCount = dbGuests.filter(g => g.status === "Reserved").length;

  let report = {
    upgradeOpportunities: availableSuites,
    upsellRevenue: arrivalsCount * 1500 + availableSuites * 5000,
    recommendations: [
      `Upsell premium suites (e.g., Suite 302/304) to incoming scheduled check-ins for a +₹5,000/night premium rate.`,
      `Auto-dispatch pre-arrival SMS proposing private Spa access at ₹1,500/session (Est: 4 arrivals will convert).`,
      `Offer early check-in options to arrivals arriving before 14:00 at a flat ₹1,000 housekeeping expedited fee.`
    ]
  };

  // If Gemini client is activated, generate actual customized smart dynamic pricing upcharges advice!
  if (client) {
    try {
      const gResponse = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are the dynamic revenue AI manager for InnSync, a high-end smart hotel.
        Current available suites: ${availableSuites}.
        Current scheduled check-ins: ${arrivalsCount}.
        Formulate three (3) highly realistic, specific dynamic upcharge recommendations (covering premium room upgrades, spa reservation offers, minibar pre-stock packages, late checkout or early check-in fees).
        Also calculate a total incremental revenue predicted from these upsells (in INR/Rupees).
        Format the output precisely as JSON matching the requested schema.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["recommendations", "upsellRevenue"],
            properties: {
              upsellRevenue: {
                type: Type.NUMBER,
                description: "Estimated total incremental revenue in INR/Rupees"
              },
              recommendations: {
                type: Type.ARRAY,
                description: "Array of three specific upcharge recommendations",
                items: { type: Type.STRING }
              }
            }
          }
        }
      });
      const parsed = JSON.parse(gResponse.text || "{}");
      if (parsed.recommendations && typeof parsed.upsellRevenue === "number") {
        report.recommendations = parsed.recommendations;
        report.upsellRevenue = Math.round(parsed.upsellRevenue);
      }
    } catch (e) {
      console.warn("AI Dynamic pricing generator fallback triggered:", e);
    }
  }

  // Adjust database revenue
  dbAnalytics.revenueToday += report.upsellRevenue;

  const notifId = `notif-${Date.now()}`;
  const newNotif: HotelNotification = {
    id: notifId,
    title: "AI Dynamic Upsell Audit",
    message: `Revenue Optimizer executed. Formulated +₹${report.upsellRevenue} in incremental premium upcharge opportunities.`,
    type: "success",
    timestamp: new Date().toISOString(),
    read: false
  };
  dbNotifications.unshift(newNotif);

  res.json({
    success: true,
    report,
    addedRevenue: report.upsellRevenue,
    notification: newNotif
  });
});

// ----------------------------------------------------
// AI Integration Services (Uses Server-Side Gemini API)
// ----------------------------------------------------

// Gemini operational summary suggestions
app.post("/api/gemini/suggest", async (req, res) => {
  const client = getGeminiClient();

  if (!client) {
    // If API key is missing, return high-quality local rule-based smart insights
    // so the app stays functional, fast, and gorgeous.
    const predictiveFallbacks = [
      {
        insight: "PREDICTIVE MAINTENANCE: Lift B cable friction logs are anomalous (2.2 mm deviation). Overhaul overdue.",
        priority: "High",
        impact: "Safety Override",
        recom: "Schedule external elevator contractor immediately to inspect cables before weekend peak check-ins."
      },
      {
        insight: "HOUSEKEEPING bottleneck detected on Floor 2.",
        priority: "Medium",
        impact: "Turn-around delay",
        recom: "Reallocate Jeremy Cole from Room 103 to Room 205 (currently in progress for 14 minutes) as a joint sweep team."
      },
      {
        insight: "VIP CHECK-IN PREPARATION: Eleanor Vance and Marcus Aurelius arriving within the hour.",
        priority: "Normal",
        impact: "Customer Satisfaction",
        recom: "Ensure Room 202 visual standards sweep is performed by Reception desk before 15:00 arrival."
      }
    ];

    return res.json({
      fallback: true,
      suggestions: predictiveFallbacks,
      aiModel: "Rule Engine Fallback (Secrets API Key Not Configured)"
    });
  }

  try {
    // Collect stats to feed Gemini
    const totalCount = dbRooms.length;
    const available = dbRooms.filter(r => r.status === "Available").length;
    const occupied = dbRooms.filter(r => r.status === "Occupied").length;
    const cleaning = dbRooms.filter(r => r.status === "Needs Cleaning").length;
    const maint = dbRooms.filter(r => r.status === "Maintenance" || r.maintenanceStatus === "Issues Open").length;
    const vipCount = dbGuests.filter(g => g.status === "CheckedIn" && g.isVIP).length;
    const openTicketsCount = dbTickets.filter(t => t.status !== "Resolved").length;

    const dataContext = `
      Current Hotel State Data Summary:
      - Total rooms: ${totalCount}
      - Available: ${available}
      - Occupied: ${occupied}
      - Needs cleaning: ${cleaning}
      - Room in Maintenance blocks: ${maint}
      - Current registered VIPs: ${vipCount}
      - Open Maintenance Issues: ${openTicketsCount}
      
      Active issues logged:
      ${JSON.stringify(dbTickets.filter(t => t.status !== "Resolved").map(t => ({ sys: t.system, desc: t.issue, prio: t.priority })))}
      
      Housekeeping crew assignments:
      ${JSON.stringify(dbStaff.filter(s => s.role === "Housekeeping Staff").map(s => ({ name: s.name, state: s.status, tasks: s.assignedTasksCount })))}
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are the lead AI Hospitality Analytics model running in Lumina Hotel Operations Platform. 
Analyze the following live metrics:
${dataContext}

Create exactly three (3) highly actionable, ultra-professional operational recommendations for the frontdesk manager. Avoid generic fluffy responses. Mention specific rooms or systems. Format as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["suggestions"],
          properties: {
            suggestions: {
              type: Type.ARRAY,
              description: "Three tailored recommendations",
              items: {
                type: Type.OBJECT,
                required: ["insight", "priority", "impact", "recom"],
                properties: {
                  insight: {
                    type: Type.STRING,
                    description: "High level problem/observation (e.g., Blockage on Floor 2)"
                  },
                  priority: {
                    type: Type.STRING,
                    description: "High | Medium | Normal"
                  },
                  impact: {
                    type: Type.STRING,
                    description: "The operational metric impacted"
                  },
                  recom: {
                    type: Type.STRING,
                    description: "Exact actionable advice for staff (e.g., reassign Technician Sylvia to Room 105)"
                  }
                }
              }
            }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      fallback: false,
      suggestions: parsed.suggestions || [],
      aiModel: "gemini-3.5-flash"
    });
  } catch (error: any) {
    console.error("Gemini suggestion error: ", error);
    res.status(500).json({ error: "Gemini server parsing error", msg: error.message });
  }
});

// Gemini voice command/transcript issue parser
app.post("/api/gemini/parse-issue", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text transcript is required" });
  }

  const client = getGeminiClient();

  if (!client) {
    // Smart heuristic fallback if client is missing
    const lowText = text.toLowerCase();
    let sys: any = "AC";
    if (lowText.includes("leak") || lowText.includes("drain") || lowText.includes("sink") || lowText.includes("toilet") || lowText.includes("plumb")) sys = "Plumbing";
    else if (lowText.includes("wifi") || lowText.includes("internet") || lowText.includes("connect")) sys = "WiFi";
    else if (lowText.includes("elevator") || lowText.includes("lift")) sys = "Lift";
    else if (lowText.includes("light") || lowText.includes("power") || lowText.includes("fuse")) sys = "Electricity";

    let roomNo: string | null = null;
    const match = lowText.match(/\d{3}/);
    if (match) roomNo = match[0];

    let prio = "Medium";
    if (lowText.includes("emergency") || lowText.includes("flood") || lowText.includes("fire") || lowText.includes("urgent")) prio = "Emergency";
    else if (lowText.includes("broken") || lowText.includes("not working") || lowText.includes("high")) prio = "High";

    return res.json({
      fallback: true,
      parsed: {
        system: sys,
        roomNumber: roomNo,
        issue: text,
        priority: prio,
        assignedTechnician: "Marcus Vance"
      }
    });
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an AI sensor dispatcher for a smart luxury hotel. Parse this raw audio transcript / frontdesk transcription notes:
      "${text}"
      
      Determine:
      1. Which primary physical system is affected (one of: "AC", "Lift", "Plumbing", "Electricity", "WiFi", "Water Leakage", "Emergency")
      2. Room visual number if referenced (e.g., "302" or null if a common floor area)
      3. A clean professional summary of the problem
      4. Priority category (one of: "Low", "Medium", "High", "Emergency")
      5. The suggested technician to assign (either "Marcus Vance" for HVAC/Plumbing, or "Sylvia Chen" for Lift/Electrical/WiFi/Networking).
      
      Return as structured JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["system", "roomNumber", "issue", "priority", "assignedTechnician"],
          properties: {
            system: {
              type: Type.STRING,
              description: "System type tag"
            },
            roomNumber: {
              type: Type.STRING,
              nullable: true,
              description: "Extracted room number or null"
            },
            issue: {
              type: Type.STRING,
              description: "Clean text representation of the ticket"
            },
            priority: {
              type: Type.STRING,
              description: "Urgency category"
            },
            assignedTechnician: {
              type: Type.STRING,
              description: "Chosen expert technician"
            }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ fallback: false, parsed });
  } catch (error: any) {
    console.error("Gemini parse issue error: ", error);
    res.status(500).json({ error: "Gemini parser failure", msg: error.message });
  }
});

// ----------------------------------------------------
// Production Static Bundles Mode vs Development Vite Middleware
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving from built static directory
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Lumina FrontDesk Server] Live running on http://0.0.0.0:${PORT}`);
    console.log(`[Environments] Running mode: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
