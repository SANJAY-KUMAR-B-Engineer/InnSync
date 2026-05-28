/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Room {
  id: string; // e.g., "101"
  roomNumber: string;
  floorNumber: number;
  roomType: "Standard" | "Deluxe" | "Suite" | "Penthouse";
  status: "Available" | "Occupied" | "Needs Cleaning" | "Maintenance" | "Reserved";
  cleaningStatus: "Clean" | "Needs Cleaning" | "In Progress" | "Delayed";
  maintenanceStatus: "Operational" | "Issues Open" | "Overdue";
  assignedGuestId: string | null;
  cleaningPriority: "Low" | "Medium" | "High";
  cleaningTimeStart: string | null; // iso timestamp when cleaning started
  cleaningElapsedSeconds: number; // accumulated cleaning active duration
  checkInTime: string | null;
  checkOutTime: string | null;
}

export interface MaintenanceTicket {
  id: string;
  system: "Lift" | "AC" | "Plumbing" | "Electricity" | "WiFi" | "Water Leakage" | "Emergency";
  roomNumber: string | null; // empty if common area
  issue: string;
  priority: "Low" | "Medium" | "High" | "Emergency";
  assignedTechnician: string;
  status: "Open" | "In Progress" | "Resolved";
  notes: string;
  creationTime: string;
  completionTime: string | null;
  photoUrl: string | null;
  isPredictive?: boolean;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "CheckedIn" | "Reserved" | "CheckedOut";
  assignedRoom: string | null;
  checkInDate: string;
  checkOutDate: string;
  paymentStatus: "Paid" | "Pending" | "Refunded";
  isVIP: boolean;
  digitalIdUrl: string | null;
  historyCount: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: "Super Admin" | "Hotel Manager" | "Receptionist" | "Housekeeping Staff" | "Technician";
  status: "On Duty" | "Off Duty" | "On Break";
  shiftTiming: string;
  assignedTasksCount: number;
  completedTasksCount: number;
  rating: number; // e.g. 4.8
}

export interface HotelNotification {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "success" | "danger";
  timestamp: string;
  read: boolean;
}

export interface HotelAnalytics {
  occupancyRate: number;
  revenueToday: number;
  activeComplaints: number;
  operationalHealthScore: number;
  revenueTrend: { date: string; value: number }[];
  occupancyTrend: { date: string; percentage: number }[];
  cleaningEfficiency: { staffName: string; averageTimeMinutes: number }[];
  maintenanceCostBySystem: { system: string; cost: number }[];
}

export interface HotelState {
  rooms: Room[];
  tickets: MaintenanceTicket[];
  guests: Guest[];
  staff: StaffMember[];
  notifications: HotelNotification[];
  analytics: HotelAnalytics;
}
