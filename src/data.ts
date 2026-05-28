/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Room, MaintenanceTicket, Guest, StaffMember, HotelNotification, HotelAnalytics } from "./types";

export const INITIAL_ROOMS: Room[] = [
  // Floor 1
  {
    id: "101",
    roomNumber: "101",
    floorNumber: 1,
    roomType: "Standard",
    status: "Occupied",
    cleaningStatus: "Clean",
    maintenanceStatus: "Operational",
    assignedGuestId: "g-1",
    cleaningPriority: "Medium",
    cleaningTimeStart: null,
    cleaningElapsedSeconds: 0,
    checkInTime: "2026-05-27T14:00:00Z",
    checkOutTime: "2026-05-30T11:00:00Z"
  },
  {
    id: "102",
    roomNumber: "102",
    floorNumber: 1,
    roomType: "Standard",
    status: "Available",
    cleaningStatus: "Clean",
    maintenanceStatus: "Operational",
    assignedGuestId: null,
    cleaningPriority: "Low",
    cleaningTimeStart: null,
    cleaningElapsedSeconds: 0,
    checkInTime: null,
    checkOutTime: null
  },
  {
    id: "103",
    roomNumber: "103",
    floorNumber: 1,
    roomType: "Standard",
    status: "Needs Cleaning",
    cleaningStatus: "Needs Cleaning",
    maintenanceStatus: "Operational",
    assignedGuestId: null,
    cleaningPriority: "High",
    cleaningTimeStart: null,
    cleaningElapsedSeconds: 0,
    checkInTime: "2026-05-25T15:00:00Z",
    checkOutTime: "2026-05-28T10:00:00Z" // Checked out today!
  },
  {
    id: "104",
    roomNumber: "104",
    floorNumber: 1,
    roomType: "Deluxe",
    status: "Occupied",
    cleaningStatus: "Clean",
    maintenanceStatus: "Operational",
    assignedGuestId: "g-2",
    cleaningPriority: "Medium",
    cleaningTimeStart: null,
    cleaningElapsedSeconds: 0,
    checkInTime: "2026-05-26T15:00:00Z",
    checkOutTime: "2026-05-29T11:00:00Z"
  },
  {
    id: "105",
    roomNumber: "105",
    floorNumber: 1,
    roomType: "Deluxe",
    status: "Maintenance",
    cleaningStatus: "Clean",
    maintenanceStatus: "Issues Open",
    assignedGuestId: null,
    cleaningPriority: "Low",
    cleaningTimeStart: null,
    cleaningElapsedSeconds: 0,
    checkInTime: null,
    checkOutTime: null
  },

  // Floor 2
  {
    id: "201",
    roomNumber: "201",
    floorNumber: 2,
    roomType: "Standard",
    status: "Occupied",
    cleaningStatus: "Clean",
    maintenanceStatus: "Operational",
    assignedGuestId: "g-3",
    cleaningPriority: "Medium",
    cleaningTimeStart: null,
    cleaningElapsedSeconds: 0,
    checkInTime: "2026-05-24T14:30:00Z",
    checkOutTime: "2026-05-28T11:00:00Z" // Scheduled checking out today!
  },
  {
    id: "202",
    roomNumber: "202",
    floorNumber: 2,
    roomType: "Standard",
    status: "Reserved",
    cleaningStatus: "Clean",
    maintenanceStatus: "Operational",
    assignedGuestId: "g-4",
    cleaningPriority: "Low",
    cleaningTimeStart: null,
    cleaningElapsedSeconds: 0,
    checkInTime: "2026-05-28T15:00:00Z", // VIP guest arriving today!
    checkOutTime: "2026-05-31T11:00:00Z"
  },
  {
    id: "203",
    roomNumber: "203",
    floorNumber: 2,
    roomType: "Standard",
    status: "Available",
    cleaningStatus: "Clean",
    maintenanceStatus: "Operational",
    assignedGuestId: null,
    cleaningPriority: "Low",
    cleaningTimeStart: null,
    cleaningElapsedSeconds: 0,
    checkInTime: null,
    checkOutTime: null
  },
  {
    id: "204",
    roomNumber: "204",
    floorNumber: 2,
    roomType: "Deluxe",
    status: "Occupied",
    cleaningStatus: "Clean",
    maintenanceStatus: "Operational",
    assignedGuestId: "g-5",
    cleaningPriority: "High",
    cleaningTimeStart: null,
    cleaningElapsedSeconds: 0,
    checkInTime: "2026-05-25T16:00:00Z",
    checkOutTime: "2026-05-30T10:00:00Z"
  },
  {
    id: "205",
    roomNumber: "205",
    floorNumber: 2,
    roomType: "Deluxe",
    status: "Occupied",
    cleaningStatus: "In Progress",
    maintenanceStatus: "Operational",
    assignedGuestId: "g-6",
    cleaningPriority: "Medium",
    cleaningTimeStart: "2026-05-28T05:15:00Z", // started 14 mins ago
    cleaningElapsedSeconds: 840,
    checkInTime: "2026-05-27T16:00:00Z",
    checkOutTime: "2026-05-29T11:00:00Z"
  },

  // Floor 3
  {
    id: "301",
    roomNumber: "301",
    floorNumber: 3,
    roomType: "Deluxe",
    status: "Available",
    cleaningStatus: "Clean",
    maintenanceStatus: "Operational",
    assignedGuestId: null,
    cleaningPriority: "Low",
    cleaningTimeStart: null,
    cleaningElapsedSeconds: 0,
    checkInTime: null,
    checkOutTime: null
  },
  {
    id: "302",
    roomNumber: "302",
    floorNumber: 3,
    roomType: "Suite",
    status: "Occupied",
    cleaningStatus: "Clean",
    maintenanceStatus: "Operational",
    assignedGuestId: "g-7",
    cleaningPriority: "High",
    cleaningTimeStart: null,
    cleaningElapsedSeconds: 0,
    checkInTime: "2026-05-23T15:00:00Z",
    checkOutTime: "2026-05-28T11:00:00Z"
  },
  {
    id: "303",
    roomNumber: "303",
    floorNumber: 3,
    roomType: "Suite",
    status: "Reserved",
    cleaningStatus: "Clean",
    maintenanceStatus: "Operational",
    assignedGuestId: "g-8",
    cleaningPriority: "Medium",
    cleaningTimeStart: null,
    cleaningElapsedSeconds: 0,
    checkInTime: "2026-05-29T14:45:00Z",
    checkOutTime: "2026-06-02T11:00:00Z"
  },
  {
    id: "304",
    roomNumber: "304",
    floorNumber: 3,
    roomType: "Penthouse",
    status: "Occupied",
    cleaningStatus: "Clean",
    maintenanceStatus: "Operational",
    assignedGuestId: "g-9",
    cleaningPriority: "High",
    cleaningTimeStart: null,
    cleaningElapsedSeconds: 0,
    checkInTime: "2026-05-26T12:00:00Z",
    checkOutTime: "2026-05-31T12:00:00Z"
  }
];

export const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: "ticket-101",
    system: "AC",
    roomNumber: "105",
    issue: "AC unit fan making high-pitched noise, insufficient cooling",
    priority: "High",
    assignedTechnician: "Marcus Vance",
    status: "In Progress",
    notes: "Part ordered. Replacing blower motor fan belt. Scheduled completion today.",
    creationTime: "2026-05-27T10:30:00Z",
    completionTime: null,
    photoUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop"
  },
  {
    id: "ticket-lift-a",
    system: "Lift",
    roomNumber: null,
    issue: "Lift B elevator cables high vibration sensor alert",
    priority: "High",
    assignedTechnician: "Sylvia Chen",
    status: "Open",
    notes: "Sensors triggered. Lift speed governed to 50% as safe fallback.",
    creationTime: "2026-05-28T02:15:00Z",
    completionTime: null,
    photoUrl: null,
    isPredictive: true
  },
  {
    id: "ticket-3",
    system: "Plumbing",
    roomNumber: "204",
    issue: "Sink hot-water handle slow leak",
    priority: "Low",
    assignedTechnician: "Marcus Vance",
    status: "Resolved",
    notes: "Replaced O-ring washer and cleared drain blockage. Fully tested.",
    creationTime: "2026-05-26T14:00:00Z",
    completionTime: "2026-05-27T11:30:00Z",
    photoUrl: null
  },
  {
    id: "ticket-wifi-3f",
    system: "WiFi",
    roomNumber: "302",
    issue: "Third floor corridor access point repeatedly disconnecting",
    priority: "Medium",
    assignedTechnician: "Sylvia Chen",
    status: "Open",
    notes: "Predictive alert: Router memory usage has touched 98% five times over past 24 hours. Needs hard firmware reflash.",
    creationTime: "2026-05-28T04:50:00Z",
    completionTime: null,
    photoUrl: null,
    isPredictive: true
  }
];

export const INITIAL_GUESTS: Guest[] = [
  {
    id: "g-1",
    name: "Eleanor Vance",
    email: "eleanor.v@saas-inc.com",
    phone: "+1 (555) 349-1102",
    status: "CheckedIn",
    assignedRoom: "101",
    checkInDate: "2026-05-27",
    checkOutDate: "2026-05-30",
    paymentStatus: "Paid",
    isVIP: false,
    digitalIdUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop",
    historyCount: 3
  },
  {
    id: "g-2",
    name: "David Sterling",
    email: "david@sterlingcapital.io",
    phone: "+1 (555) 901-2244",
    status: "CheckedIn",
    assignedRoom: "104",
    checkInDate: "2026-05-26",
    checkOutDate: "2026-05-29",
    paymentStatus: "Pending",
    isVIP: true,
    digitalIdUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop",
    historyCount: 14
  },
  {
    id: "g-3",
    name: "Yuki Tanaka",
    email: "yuki.tanaka@tokyo-design.jp",
    phone: "+81 90-1234-5678",
    status: "CheckedIn",
    assignedRoom: "201",
    checkInDate: "2026-05-24",
    checkOutDate: "2026-05-28",
    paymentStatus: "Paid",
    isVIP: false,
    digitalIdUrl: null,
    historyCount: 1
  },
  {
    id: "g-4",
    name: "Marcus Aurelius Jr",
    email: "maurelius@republic.edu",
    phone: "+1 (555) 100-2000",
    status: "Reserved",
    assignedRoom: "202",
    checkInDate: "2026-05-28",
    checkOutDate: "2026-05-31",
    paymentStatus: "Paid",
    isVIP: true,
    digitalIdUrl: null,
    historyCount: 22
  },
  {
    id: "g-5",
    name: "Chloe Dupont",
    email: "chloe.dupont@loreal.fr",
    phone: "+33 6 12 34 56 78",
    status: "CheckedIn",
    assignedRoom: "204",
    checkInDate: "2026-05-25",
    checkOutDate: "2026-05-30",
    paymentStatus: "Paid",
    isVIP: false,
    digitalIdUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop",
    historyCount: 2
  },
  {
    id: "g-6",
    name: "Harrison Forde",
    email: "harrison@forde-architects.nz",
    phone: "+64 21 887 990",
    status: "CheckedIn",
    assignedRoom: "205",
    checkInDate: "2026-05-27",
    checkOutDate: "2026-05-29",
    paymentStatus: "Pending",
    isVIP: false,
    digitalIdUrl: null,
    historyCount: 5
  },
  {
    id: "g-7",
    name: "Sophia Loren-Ross",
    email: "sophia@ross-collection.org",
    phone: "+1 (555) 777-8899",
    status: "CheckedIn",
    assignedRoom: "302",
    checkInDate: "2026-05-23",
    checkOutDate: "2026-05-28",
    paymentStatus: "Paid",
    isVIP: true,
    digitalIdUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop",
    historyCount: 8
  },
  {
    id: "g-8",
    name: "Nate Diaz",
    email: "nate@strikeback.com",
    phone: "+1 (555) 209-1811",
    status: "Reserved",
    assignedRoom: "303",
    checkInDate: "2026-05-29",
    checkOutDate: "2026-06-02",
    paymentStatus: "Pending",
    isVIP: false,
    digitalIdUrl: null,
    historyCount: 0
  },
  {
    id: "g-9",
    name: "Dr. Catherine Bishop",
    email: "cbishop@mayoclinic.org",
    phone: "+1 (555) 489-3012",
    status: "CheckedIn",
    assignedRoom: "304",
    checkInDate: "2026-05-26",
    checkOutDate: "2026-05-31",
    paymentStatus: "Paid",
    isVIP: true,
    digitalIdUrl: null,
    historyCount: 19
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: "s-1",
    name: "Arthur Pendelton",
    role: "Hotel Manager",
    status: "On Duty",
    shiftTiming: "08:00 - 17:00",
    assignedTasksCount: 4,
    completedTasksCount: 22,
    rating: 4.9
  },
  {
    id: "s-2",
    name: "Maria Gonzales",
    role: "Housekeeping Staff",
    status: "On Duty",
    shiftTiming: "06:00 - 14:00",
    assignedTasksCount: 2,
    completedTasksCount: 84,
    rating: 4.8
  },
  {
    id: "s-3",
    name: "Jeremy Cole",
    role: "Housekeeping Staff",
    status: "On Duty",
    shiftTiming: "06:00 - 14:00",
    assignedTasksCount: 1,
    completedTasksCount: 76,
    rating: 4.6
  },
  {
    id: "s-4",
    name: "Marcus Vance",
    role: "Technician",
    status: "On Duty",
    shiftTiming: "09:00 - 18:00",
    assignedTasksCount: 3,
    completedTasksCount: 39,
    rating: 4.7
  },
  {
    id: "s-5",
    name: "Sylvia Chen",
    role: "Technician",
    status: "On Duty",
    shiftTiming: "12:00 - 21:00",
    assignedTasksCount: 2,
    completedTasksCount: 45,
    rating: 4.9
  },
  {
    id: "s-6",
    name: "Liam O'Connor",
    role: "Receptionist",
    status: "On Duty",
    shiftTiming: "07:00 - 15:00",
    assignedTasksCount: 10,
    completedTasksCount: 121,
    rating: 4.8
  }
];

export const INITIAL_NOTIFICATIONS: HotelNotification[] = [
  {
    id: "notif-1",
    title: "Overdue Housekeeping Alert",
    message: "Room 205 cleaning is currently exceeding standard turn times by 12 minutes.",
    type: "warning",
    timestamp: "2026-05-28T05:20:00Z",
    read: false
  },
  {
    id: "notif-2",
    title: "VIP Incoming Arrival",
    message: "VIP guest Marcus Aurelius Jr. (Room 202) is estimated to arrive in 35 minutes.",
    type: "info",
    timestamp: "2026-05-28T05:10:00Z",
    read: false
  },
  {
    id: "notif-3",
    title: "Critical Telemetry Alert",
    message: "Water tank B levels dropped below 15% capacity limit. Reserve valve opened automatically.",
    type: "danger",
    timestamp: "2026-05-28T04:45:00Z",
    read: false
  },
  {
    id: "notif-4",
    title: "Preventative Maintenance",
    message: "Vibration sensors on Lift B detected a deviation of 2.2 mm. Cable check suggested.",
    type: "warning",
    timestamp: "2026-05-27T19:00:00Z",
    read: true
  }
];

export const INITIAL_ANALYTICS: HotelAnalytics = {
  occupancyRate: 72,
  revenueToday: 15470,
  activeComplaints: 3,
  operationalHealthScore: 94,
  revenueTrend: [
    { date: "May 22", value: 12400 },
    { date: "May 23", value: 14100 },
    { date: "May 24", value: 13500 },
    { date: "May 25", value: 15800 },
    { date: "May 26", value: 16200 },
    { date: "May 27", value: 14900 },
    { date: "May 28", value: 15470 }
  ],
  occupancyTrend: [
    { date: "May 22", percentage: 65 },
    { date: "May 23", percentage: 70 },
    { date: "May 24", percentage: 68 },
    { date: "May 25", percentage: 74 },
    { date: "May 26", percentage: 79 },
    { date: "May 27", percentage: 71 },
    { date: "May 28", percentage: 72 }
  ],
  cleaningEfficiency: [
    { staffName: "Maria Gonzales", averageTimeMinutes: 24 },
    { staffName: "Jeremy Cole", averageTimeMinutes: 29 },
    { staffName: "Arthur Pendelton", averageTimeMinutes: 32 }
  ],
  maintenanceCostBySystem: [
    { system: "AC", cost: 1240 },
    { system: "Lift", cost: 2100 },
    { system: "Plumbing", cost: 450 },
    { system: "WiFi", cost: 120 },
    { system: "Electricity", cost: 890 }
  ]
};
