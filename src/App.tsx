/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Bell, 
  Menu, 
  X, 
  AlertOctagon, 
  VolumeX, 
  CheckCheck,
  Building2,
  LogOut,
  User,
  ShieldAlert
} from "lucide-react";
import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  setDoc, 
  getDoc,
  query, 
  orderBy, 
  getDocs,
  writeBatch
} from "firebase/firestore";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";

import { Room, MaintenanceTicket, Guest, StaffMember, HotelNotification } from "./types";
import { db, auth, handleFirestoreError, OperationType, testConnection } from "./firebase";
import { seedDatabaseIfEmpty } from "./seed";
import {
  INITIAL_ROOMS,
  INITIAL_TICKETS,
  INITIAL_GUESTS,
  INITIAL_STAFF,
  INITIAL_NOTIFICATIONS
} from "./data";

import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Rooms from "./components/Rooms";
import Housekeeping from "./components/Housekeeping";
import Maintenance from "./components/Maintenance";
import Guests from "./components/Guests";
import Staff from "./components/Staff";
import AISuggestions from "./components/AISuggestions";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import AuthPortal from "./components/AuthPortal";

// Dynamic Financials calculation helper based on Room Type pricing and Paid resident portfolios
const calculateFinancials = (currentRooms: Room[], currentGuests: Guest[]) => {
  const totalRoomsCount = currentRooms.length || 18; // base capacity
  const occupiedRoomsCount = currentRooms.filter(r => r.status === "Occupied").length;
  
  // Calculate revenue based on guest payment status:
  // Paid / Verified CheckedIn or Reserved guests contribute
  let revenue = 0;
  
  currentGuests.forEach(g => {
    if (g.paymentStatus === "Paid") {
      let rate = 12000; // standard price in Rupees (e.g. standard rate ₹12,000)
      if (g.assignedRoom) {
        const roomObj = currentRooms.find(r => r.roomNumber === g.assignedRoom);
        if (roomObj) {
          if (roomObj.roomType === "Standard") rate = 8000;
          else if (roomObj.roomType === "Deluxe") rate = 12000;
          else if (roomObj.roomType === "Suite") rate = 25000;
          else if (roomObj.roomType === "Penthouse") rate = 65000;
        }
      }
      revenue += rate;
    }
  });

  if (revenue === 0) {
    // Elegant fallback of ₹12,54,700 base performance to keep layouts dynamic and realistic for INR
    revenue = occupiedRoomsCount > 0 ? occupiedRoomsCount * 12000 : 1254700;
  }

  const avgDailyRate = occupiedRoomsCount > 0 
    ? Math.round(revenue / occupiedRoomsCount) 
    : 16500; // baseline industry ADR in Rupees

  const revpar = Math.round(revenue / totalRoomsCount);

  // Growth calculated dynamically against a yesterday benchmark profile of ₹11,35,000
  const yesterdayRevenue = 1135000;
  const growthPercentage = Number((((revenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1));

  return {
    todayRevenue: revenue,
    avgDailyRate,
    revpar,
    growthPercentage
  };
};

export default function App() {
  const [currentTab, setCurrentTab] = React.useState("dashboard");
  const [selectedProperty, setSelectedProperty] = React.useState("InnSync Central Flagship");
  const [emergencyActive, setEmergencyActive] = React.useState(false);

  // Auth States
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [userInfo, setUserInfo] = React.useState<{ name: string; role: string } | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  // Core state from Firestore db
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [tickets, setTickets] = React.useState<MaintenanceTicket[]>([]);
  const [guests, setGuests] = React.useState<Guest[]>([]);
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [notifications, setNotifications] = React.useState<HotelNotification[]>([]);
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [financials, setFinancials] = React.useState<{
    todayRevenue: number;
    avgDailyRate: number;
    revpar: number;
    growthPercentage: number;
  } | null>(null);
  
  const [bonusRevenue, setBonusRevenue] = React.useState<number>(() => {
    const saved = localStorage.getItem("innsync_bonus_revenue");
    return saved ? Number(saved) : 0;
  });

  const [loading, setLoading] = React.useState(true);
  const [showNotificationsPane, setShowNotificationsPane] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const notificationsShelfRef = React.useRef<HTMLDivElement>(null);
  const notificationsBellBtnRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showNotificationsPane &&
        notificationsShelfRef.current &&
        !notificationsShelfRef.current.contains(event.target as Node) &&
        notificationsBellBtnRef.current &&
        !notificationsBellBtnRef.current.contains(event.target as Node)
      ) {
        setShowNotificationsPane(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationsPane]);

  // Monitor Authentication State
  React.useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthLoading(true);
      if (currentUser) {
        setUser(currentUser);
        
        // Start live bootstrapping if database collections are empty
        await seedDatabaseIfEmpty();

        // Read user details from the 'staff' collection in Firestore
        try {
          const staffSnap = await getDoc(doc(db, "staff", currentUser.uid));
          if (staffSnap.exists()) {
            const data = staffSnap.data();
            setUserInfo({ name: data.name, role: data.role });
          } else {
            // Default role if not mapped
            setUserInfo({ name: currentUser.email?.split("@")[0] || "Staff", role: "Receptionist" });
          }
        } catch (err) {
          console.error("Failed fetching user staff metadata during auth hook:", err);
          setUserInfo({ name: currentUser.email?.split("@")[0] || "Staff", role: "Receptionist" });
        }
      } else {
        setUser(null);
        setUserInfo(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore changes in real-time when authenticated
  React.useEffect(() => {
    if (!user) {
      setRooms([]);
      setTickets([]);
      setGuests([]);
      setStaff([]);
      setNotifications([]);
      setLoading(false);
      return;
    }

    if (user.uid === "sandbox-mode") {
      // Offline sandbox handles local storage loads, so we don't start the real-time Firebase listeners!
      return;
    }

    setLoading(true);

    // 1. Rooms Snap
    const unsubRooms = onSnapshot(collection(db, "rooms"), (snap) => {
      const roomsData: Room[] = [];
      snap.forEach((docSnap) => {
        roomsData.push(docSnap.data() as Room);
      });
      roomsData.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
      setRooms(roomsData);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "rooms");
    });

    // 2. Guests Snap
    const unsubGuests = onSnapshot(collection(db, "guests"), (snap) => {
      const guestsData: Guest[] = [];
      snap.forEach((docSnap) => {
        guestsData.push(docSnap.data() as Guest);
      });
      setGuests(guestsData);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "guests");
    });

    // 3. Staff Snap
    const unsubStaff = onSnapshot(collection(db, "staff"), (snap) => {
      const staffData: StaffMember[] = [];
      snap.forEach((docSnap) => {
        staffData.push(docSnap.data() as StaffMember);
      });
      setStaff(staffData);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "staff");
    });

    // 4. Maintenance / Tickets Snap
    const unsubTickets = onSnapshot(collection(db, "maintenance"), (snap) => {
      const ticketsData: MaintenanceTicket[] = [];
      snap.forEach((docSnap) => {
        ticketsData.push(docSnap.data() as MaintenanceTicket);
      });
      ticketsData.sort((a, b) => b.creationTime.localeCompare(a.creationTime));
      setTickets(ticketsData);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "maintenance");
    });

    // 5. Notifications Snap
    const unsubNotifs = onSnapshot(
      query(collection(db, "notifications"), orderBy("timestamp", "desc")),
      (snap) => {
        const notifsData: HotelNotification[] = [];
        snap.forEach((docSnap) => {
          notifsData.push(docSnap.data() as HotelNotification);
        });
        setNotifications(notifsData);
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "notifications");
      }
    );

    // 6. Financials Today document Snap
    const unsubFinancials = onSnapshot(doc(db, "financials", "today"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFinancials({
          todayRevenue: Number(data.todayRevenue || 0),
          avgDailyRate: Number(data.avgDailyRate || 0),
          revpar: Number(data.revpar || 0),
          growthPercentage: Number(data.growthPercentage || 0)
        });
      }
    }, (err) => {
      console.warn("Financials today subscription issue:", err);
    });

    return () => {
      unsubRooms();
      unsubGuests();
      unsubStaff();
      unsubTickets();
      unsubNotifs();
      unsubFinancials();
    };
  }, [user]);

  // Load local sandbox storage if in sandbox-mode
  React.useEffect(() => {
    if (user && user.uid === "sandbox-mode") {
      setLoading(true);
      
      const localRooms = localStorage.getItem("lumina_rooms");
      const localTickets = localStorage.getItem("lumina_tickets");
      const localGuests = localStorage.getItem("lumina_guests");
      const localStaff = localStorage.getItem("lumina_staff");
      const localNotifs = localStorage.getItem("lumina_notifications");

      if (localRooms) {
        setRooms(JSON.parse(localRooms));
      } else {
        setRooms(INITIAL_ROOMS);
        localStorage.setItem("lumina_rooms", JSON.stringify(INITIAL_ROOMS));
      }

      if (localTickets) {
        setTickets(JSON.parse(localTickets));
      } else {
        setTickets(INITIAL_TICKETS);
        localStorage.setItem("lumina_tickets", JSON.stringify(INITIAL_TICKETS));
      }

      if (localGuests) {
        setGuests(JSON.parse(localGuests));
      } else {
        setGuests(INITIAL_GUESTS);
        localStorage.setItem("lumina_guests", JSON.stringify(INITIAL_GUESTS));
      }

      const staffWithDev = [...INITIAL_STAFF];
      if (!staffWithDev.some(s => s.id === "sandbox-mode")) {
        staffWithDev.push({
          id: "sandbox-mode",
          name: userInfo?.name || "Arthur Pendelton",
          role: (userInfo?.role as any) || "Hotel Manager",
          status: "On Duty",
          shiftTiming: "09:00 - 18:00",
          assignedTasksCount: 0,
          completedTasksCount: 22,
          rating: 4.8
        });
      }

      if (localStaff) {
        setStaff(JSON.parse(localStaff));
      } else {
        setStaff(staffWithDev);
        localStorage.setItem("lumina_staff", JSON.stringify(staffWithDev));
      }

      if (localNotifs) {
        setNotifications(JSON.parse(localNotifs));
      } else {
        setNotifications(INITIAL_NOTIFICATIONS);
        localStorage.setItem("lumina_notifications", JSON.stringify(INITIAL_NOTIFICATIONS));
      }

      const initialFin = calculateFinancials(
        localRooms ? JSON.parse(localRooms) : INITIAL_ROOMS,
        localGuests ? JSON.parse(localGuests) : INITIAL_GUESTS
      );
      setFinancials(initialFin);
      localStorage.setItem("lumina_financials", JSON.stringify(initialFin));

      setLoading(false);
    }
  }, [user, userInfo]);

  // Handle dynamic analytics calculations based on live rooms and maintenance lists
  React.useEffect(() => {
    if (rooms.length === 0) return;

    const totalRooms = rooms.length;
    const occupiedCount = rooms.filter(r => r.status === "Occupied").length;
    const maintenanceCount = rooms.filter(r => r.status === "Maintenance" || r.maintenanceStatus === "Issues Open").length;
    const cleaningCount = rooms.filter(r => r.status === "Needs Cleaning" || r.cleaningStatus === "In Progress" || r.cleaningStatus === "Delayed").length;

    const occupancyRate = Math.round((occupiedCount / totalRooms) * 100);
    const activeComplaints = tickets.filter(t => t.status !== "Resolved").length;

    let healthScore = 100;
    healthScore -= (activeComplaints * 3); // -3% per open ticket
    healthScore -= (cleaningCount * 2); // -2% per uncleaned room
    healthScore -= (maintenanceCount * 4); // -4% per out-of-order room
    if (healthScore < 40) healthScore = 40;

    const calculatedAnalytics = {
      occupancyRate,
      revenueToday: occupiedCount * 12000 + bonusRevenue,
      activeComplaints,
      operationalHealthScore: Math.min(100, Math.round(healthScore)),
      revenueTrend: [
        { date: "Mon", value: 105400 },
        { date: "Tue", value: 111300 },
        { date: "Wed", value: 121500 },
        { date: "Thu", value: 118900 },
        { date: "Fri", value: occupiedCount * 12000 + bonusRevenue }
      ],
      occupancyTrend: [
        { date: "Mon", percentage: 65 },
        { date: "Tue", percentage: 70 },
        { date: "Wed", percentage: 75 },
        { date: "Thu", percentage: 80 },
        { date: "Fri", percentage: occupancyRate }
      ],
      cleaningEfficiency: [
        { staffName: "Maria Gonzales", averageTimeMinutes: 28 },
        { staffName: "Jeremy Cole", averageTimeMinutes: 32 }
      ],
      maintenanceCostBySystem: [
        { system: "AC", cost: 1200 },
        { system: "Lift", cost: 4500 },
        { system: "Plumbing", cost: 800 },
        { system: "Electricity", cost: 1500 }
      ]
    };

    setAnalytics(calculatedAnalytics);
  }, [rooms, tickets, bonusRevenue]);

  // Synchronize dynamic financials state and backend whenever rooms or guests change
  React.useEffect(() => {
    if (rooms.length === 0 || guests.length === 0) return;

    const nextFin = calculateFinancials(rooms, guests);

    // Prevent write loops by performing target match guardchecks
    if (
      financials &&
      financials.todayRevenue === nextFin.todayRevenue &&
      financials.avgDailyRate === nextFin.avgDailyRate &&
      financials.revpar === nextFin.revpar &&
      financials.growthPercentage === nextFin.growthPercentage
    ) {
      return;
    }

    if (user?.uid === "sandbox-mode") {
      setFinancials(nextFin);
      localStorage.setItem("lumina_financials", JSON.stringify(nextFin));
    } else if (user) {
      // Dynamic write back to doc today in financials collection
      const docRef = doc(db, "financials", "today");
      setDoc(docRef, nextFin).catch(err => {
        console.warn("Retrying direct setDoc credentials sync: ", err);
      });
    } else {
      setFinancials(nextFin);
    }
  }, [rooms, guests, user, financials]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error: ", err);
    }
    setUser(null);
    setUserInfo(null);
  };

  const handleAuthSuccess = (fireUser: any, role: string, name: string) => {
    setUser(fireUser);
    setUserInfo({ role, name });
  };

  // --- BUSINESS OPERATIONS DIRECTLY SUPPORTED IN FIRESTORE WRITES ---

  // Check-in workflow
  const handleCheckin = async (guestId: string, roomId: string) => {
    if (user?.uid === "sandbox-mode") {
      const targetRoom = rooms.find(r => r.id === roomId);
      const roomNum = targetRoom ? targetRoom.roomNumber : "Room";
      const targetGuest = guests.find(g => g.id === guestId);
      const guestName = targetGuest ? targetGuest.name : "Guest";

      const updatedRooms = rooms.map(room => room.id === roomId ? {
        ...room,
        status: "Occupied" as const,
        assignedGuestId: guestId,
        checkInTime: new Date().toISOString(),
        checkOutTime: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString()
      } : room);

      const updatedGuests = guests.map(guest => guest.id === guestId ? {
        ...guest,
        status: "CheckedIn" as const,
        assignedRoom: roomNum
      } : guest);

      const notifId = `notif-${Date.now()}`;
      const newNotif: HotelNotification = {
        id: notifId,
        title: "Check-in Successful",
        message: `Guest ${guestName} checked into Room ${roomNum} successfully.`,
        type: "success",
        timestamp: new Date().toISOString(),
        read: false
      };
      const updatedNotifs = [newNotif, ...notifications];

      setRooms(updatedRooms);
      setGuests(updatedGuests);
      setNotifications(updatedNotifs);

      localStorage.setItem("lumina_rooms", JSON.stringify(updatedRooms));
      localStorage.setItem("lumina_guests", JSON.stringify(updatedGuests));
      localStorage.setItem("lumina_notifications", JSON.stringify(updatedNotifs));
      return;
    }

    const batch = writeBatch(db);
    try {
      const roomRef = doc(db, "rooms", roomId);
      const guestRef = doc(db, "guests", guestId);
      
      const guestDoc = await getDoc(guestRef);
      const guestName = guestDoc.exists() ? guestDoc.data().name : "Guest";

      const r = rooms.find(room => room.id === roomId);
      const roomNumber = r ? r.roomNumber : "Room";

      // 1. Room updates
      batch.update(roomRef, {
        status: "Occupied",
        assignedGuestId: guestId,
        checkInTime: new Date().toISOString(),
        checkOutTime: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString()
      });

      // 2. Guest updates
      batch.update(guestRef, {
        status: "CheckedIn",
        assignedRoom: roomNumber
      });

      // 3. Notification log
      const notifId = `notif-${Date.now()}`;
      const notifRef = doc(db, "notifications", notifId);
      batch.set(notifRef, {
        id: notifId,
        title: "Check-in Successful",
        message: `Guest ${guestName} checked into Room ${roomNumber} successfully.`,
        type: "success",
        timestamp: new Date().toISOString(),
        read: false
      });

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `rooms/${roomId}`);
    }
  };

  // Checkout Completed
  const handleCheckout = async (roomId: string) => {
    if (user?.uid === "sandbox-mode") {
      const r = rooms.find(room => room.id === roomId);
      if (!r) return;
      const guestId = r.assignedGuestId;

      const updatedRooms = rooms.map(room => room.id === roomId ? {
        ...room,
        status: "Needs Cleaning" as const,
        cleaningStatus: "Needs Cleaning" as const,
        assignedGuestId: null,
        checkInTime: null,
        checkOutTime: null
      } : room);

      const updatedGuests = guests.map(guest => guest.id === guestId ? {
        ...guest,
        status: "CheckedOut" as const,
        assignedRoom: null
      } : guest);

      const notifId = `notif-${Date.now()}`;
      const newNotif: HotelNotification = {
        id: notifId,
        title: `Room ${r.roomNumber} Checked Out`,
        message: `Checkout completed. Room priority turned High. Dispatched queue for housekeepers.`,
        type: "warning",
        timestamp: new Date().toISOString(),
        read: false
      };
      const updatedNotifs = [newNotif, ...notifications];

      setRooms(updatedRooms);
      setGuests(updatedGuests);
      setNotifications(updatedNotifs);

      localStorage.setItem("lumina_rooms", JSON.stringify(updatedRooms));
      localStorage.setItem("lumina_guests", JSON.stringify(updatedGuests));
      localStorage.setItem("lumina_notifications", JSON.stringify(updatedNotifs));
      return;
    }

    const batch = writeBatch(db);
    try {
      const roomRef = doc(db, "rooms", roomId);
      const r = rooms.find(room => room.id === roomId);
      if (!r) return;

      const guestId = r.assignedGuestId;

      // 1. Update guest if linked
      if (guestId) {
        const guestRef = doc(db, "guests", guestId);
        batch.update(guestRef, {
          status: "CheckedOut",
          assignedRoom: null
        });
      }

      // 2. Update room settings to dirty
      batch.update(roomRef, {
        status: "Needs Cleaning",
        cleaningStatus: "Needs Cleaning",
        assignedGuestId: null,
        checkInTime: null,
        checkOutTime: null
      });

      // 3. System warning notification
      const notifId = `notif-${Date.now()}`;
      const notifRef = doc(db, "notifications", notifId);
      batch.set(notifRef, {
        id: notifId,
        title: `Room ${r.roomNumber} Checked Out`,
        message: `Checkout completed. Room priority turned High. Dispatched queue for housekeepers.`,
        type: "warning",
        timestamp: new Date().toISOString(),
        read: false
      });

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `rooms/${roomId}`);
    }
  };

  // Direct status updates
  const handleUpdateRoomStatus = async (
    roomId: string, 
    status: any, 
    cleaningStatus?: any, 
    maintenanceStatus?: any
  ) => {
    if (user?.uid === "sandbox-mode") {
      const updatedRooms = rooms.map(room => {
        if (room.id === roomId) {
          const upd: any = { ...room };
          if (status !== undefined) upd.status = status;
          if (cleaningStatus !== undefined) upd.cleaningStatus = cleaningStatus;
          if (maintenanceStatus !== undefined) upd.maintenanceStatus = maintenanceStatus;
          if (cleaningStatus === "Clean") {
            upd.cleaningTimeStart = null;
            upd.cleaningElapsedSeconds = 0;
          }
          return upd;
        }
        return room;
      });
      setRooms(updatedRooms);
      localStorage.setItem("lumina_rooms", JSON.stringify(updatedRooms));
      return;
    }

    try {
      const roomRef = doc(db, "rooms", roomId);
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (cleaningStatus !== undefined) updateData.cleaningStatus = cleaningStatus;
      if (maintenanceStatus !== undefined) updateData.maintenanceStatus = maintenanceStatus;

      if (cleaningStatus === "Clean") {
        updateData.cleaningTimeStart = null;
        updateData.cleaningElapsedSeconds = 0;
      }

      await updateDoc(roomRef, updateData);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${roomId}`);
    }
  };

  // Handlers for Cleaning Assignments
  const handleAssignHousekeeping = async (roomId: string, staffName: string, priority: string) => {
    if (user?.uid === "sandbox-mode") {
      const updatedRooms = rooms.map(room => room.id === roomId ? {
        ...room,
        cleaningStatus: "In Progress" as const,
        cleaningPriority: (priority || "Medium") as any,
        cleaningTimeStart: new Date().toISOString()
      } : room);

      let updatedStaff = [...staff];
      if (staffName) {
        updatedStaff = staff.map(member => member.name === staffName ? {
          ...member,
          assignedTasksCount: member.assignedTasksCount + 1
        } : member);
      }

      setRooms(updatedRooms);
      setStaff(updatedStaff);

      localStorage.setItem("lumina_rooms", JSON.stringify(updatedRooms));
      localStorage.setItem("lumina_staff", JSON.stringify(updatedStaff));
      return;
    }

    const batch = writeBatch(db);
    try {
      const roomRef = doc(db, "rooms", roomId);
      batch.update(roomRef, {
        cleaningStatus: "In Progress",
        cleaningPriority: priority || "Medium",
        cleaningTimeStart: new Date().toISOString()
      });

      if (staffName) {
        const member = staff.find(s => s.name === staffName);
        if (member) {
          const staffRef = doc(db, "staff", member.id);
          batch.update(staffRef, {
            assignedTasksCount: member.assignedTasksCount + 1
          });
        }
      }

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `rooms/${roomId}`);
    }
  };

  const handleForceAvailable = async (roomId: string) => {
    if (user?.uid === "sandbox-mode") {
      const r = rooms.find(room => room.id === roomId);
      if (!r) return;

      const updatedRooms = rooms.map(room => room.id === roomId ? {
        ...room,
        status: "Available" as const,
        cleaningStatus: "Clean" as const,
        cleaningTimeStart: null,
        cleaningElapsedSeconds: 0
      } : room);

      const notifId = `notif-${Date.now()}`;
      const newNotif: HotelNotification = {
        id: notifId,
        title: "Cleaning Complete Room " + r.roomNumber,
        message: `Staff finalized cleaning audit. Status is set to Available.`,
        type: "success" as const,
        timestamp: new Date().toISOString(),
        read: false
      };

      const updatedNotifs = [newNotif, ...notifications];

      setRooms(updatedRooms);
      setNotifications(updatedNotifs);

      localStorage.setItem("lumina_rooms", JSON.stringify(updatedRooms));
      localStorage.setItem("lumina_notifications", JSON.stringify(updatedNotifs));
      return;
    }

    const batch = writeBatch(db);
    try {
      const roomRef = doc(db, "rooms", roomId);
      const r = rooms.find(room => room.id === roomId);
      if (!r) return;

      batch.update(roomRef, {
        status: "Available",
        cleaningStatus: "Clean",
        cleaningTimeStart: null,
        cleaningElapsedSeconds: 0
      });

      const notifId = `notif-${Date.now()}`;
      const notifRef = doc(db, "notifications", notifId);
      batch.set(notifRef, {
        id: notifId,
        title: "Cleaning Complete Room " + r.roomNumber,
        message: `Staff finalized cleaning audit. Status is set to Available.`,
        type: "success",
        timestamp: new Date().toISOString(),
        read: false
      });

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `rooms/${roomId}`);
    }
  };

  // Add Maintenance Ticket
  const handleAddTicket = async (ticketData: any) => {
    if (user?.uid === "sandbox-mode") {
      const ticketId = `ticket-${Date.now()}`;
      const newTicket: MaintenanceTicket = {
        id: ticketId,
        system: ticketData.system || "AC",
        roomNumber: ticketData.roomNumber || null,
        issue: ticketData.issue || "Telemetry Warning",
        priority: ticketData.priority || "Medium",
        assignedTechnician: ticketData.assignedTechnician || "Staff Technician",
        status: "Open" as const,
        notes: ticketData.notes || "Ticket created via operations console.",
        creationTime: new Date().toISOString(),
        completionTime: null,
        photoUrl: null,
        isPredictive: !!ticketData.isPredictive
      };

      const updatedTickets = [newTicket, ...tickets];

      let updatedRooms = [...rooms];
      if (ticketData.roomNumber) {
        updatedRooms = rooms.map(room => room.roomNumber === ticketData.roomNumber ? {
          ...room,
          status: "Maintenance" as const,
          maintenanceStatus: "Issues Open" as const
        } : room);
      }

      const notifId = `notif-${Date.now()}`;
      const newNotif: HotelNotification = {
        id: notifId,
        title: `Maintenance dispatch: ${ticketData.system}`,
        message: `Issue logged in ${ticketData.roomNumber ? 'Room ' + ticketData.roomNumber : 'Common Area'}. Priority Level ${ticketData.priority}.`,
        type: ticketData.priority === "Emergency" || ticketData.priority === "High" ? "danger" as const : "warning" as const,
        timestamp: new Date().toISOString(),
        read: false
      };

      const updatedNotifs = [newNotif, ...notifications];

      setTickets(updatedTickets);
      setRooms(updatedRooms);
      setNotifications(updatedNotifs);

      localStorage.setItem("lumina_tickets", JSON.stringify(updatedTickets));
      localStorage.setItem("lumina_rooms", JSON.stringify(updatedRooms));
      localStorage.setItem("lumina_notifications", JSON.stringify(updatedNotifs));
      return;
    }

    const batch = writeBatch(db);
    try {
      const ticketId = `ticket-${Date.now()}`;
      const ticketRef = doc(db, "maintenance", ticketId);

      const newTicket: MaintenanceTicket = {
        id: ticketId,
        system: ticketData.system || "AC",
        roomNumber: ticketData.roomNumber || null,
        issue: ticketData.issue || "Telemetry Warning",
        priority: ticketData.priority || "Medium",
        assignedTechnician: ticketData.assignedTechnician || "Staff Technician",
        status: "Open",
        notes: ticketData.notes || "Ticket created via operations console.",
        creationTime: new Date().toISOString(),
        completionTime: null,
        photoUrl: null,
        isPredictive: !!ticketData.isPredictive
      };

      batch.set(ticketRef, newTicket);

      // Lock room to service block if applicable
      if (ticketData.roomNumber) {
        const roomMatch = rooms.find(room => room.roomNumber === ticketData.roomNumber);
        if (roomMatch) {
          const roomRef = doc(db, "rooms", roomMatch.id);
          batch.update(roomRef, {
            status: "Maintenance",
            maintenanceStatus: "Issues Open"
          });
        }
      }

      // Live alert dispatch
      const notifId = `notif-${Date.now()}`;
      const notifRef = doc(db, "notifications", notifId);
      batch.set(notifRef, {
        id: notifId,
        title: `Maintenance dispatch: ${ticketData.system}`,
        message: `Issue logged in ${ticketData.roomNumber ? 'Room ' + ticketData.roomNumber : 'Common Area'}. Priority Level ${ticketData.priority}.`,
        type: ticketData.priority === "Emergency" || ticketData.priority === "High" ? "danger" : "warning",
        timestamp: new Date().toISOString(),
        read: false
      });

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "maintenance");
    }
  };

  // Resolve Maintenance Ticket
  const handleUpdateTicketStatus = async (
    ticketId: string, 
    status: "In Progress" | "Resolved", 
    notes?: string
  ) => {
    if (user?.uid === "sandbox-mode") {
      const ticketMatch = tickets.find(t => t.id === ticketId);
      if (!ticketMatch) return;

      const updatedTickets = tickets.map(t => {
        if (t.id === ticketId) {
          const upd: any = { ...t, status };
          if (notes !== undefined) upd.notes = notes;
          if (status === "Resolved") {
            upd.completionTime = new Date().toISOString();
          }
          return upd;
        }
        return t;
      });

      let updatedRooms = [...rooms];
      if (status === "Resolved" && ticketMatch.roomNumber) {
        const activeSibs = updatedTickets.filter(
          t => t.roomNumber === ticketMatch.roomNumber && t.status !== "Resolved"
        );
        if (activeSibs.length === 0) {
          updatedRooms = rooms.map(r => r.roomNumber === ticketMatch.roomNumber ? {
            ...r,
            status: "Available" as const,
            maintenanceStatus: "Operational" as const
          } : r);
        }
      }

      setTickets(updatedTickets);
      setRooms(updatedRooms);

      localStorage.setItem("lumina_tickets", JSON.stringify(updatedTickets));
      localStorage.setItem("lumina_rooms", JSON.stringify(updatedRooms));
      return;
    }

    const batch = writeBatch(db);
    try {
      const ticketRef = doc(db, "maintenance", ticketId);
      const ticketMatch = tickets.find(t => t.id === ticketId);
      if (!ticketMatch) return;

      const updateData: any = { status };
      if (notes !== undefined) updateData.notes = notes;

      if (status === "Resolved") {
        updateData.completionTime = new Date().toISOString();
        
        // Release room lock if all tickets for this room are resolved
        if (ticketMatch.roomNumber) {
          const activeSibs = tickets.filter(
            t => t.roomNumber === ticketMatch.roomNumber && t.status !== "Resolved" && t.id !== ticketId
          );
          if (activeSibs.length === 0) {
            const roomMatch = rooms.find(r => r.roomNumber === ticketMatch.roomNumber);
            if (roomMatch) {
              const roomRef = doc(db, "rooms", roomMatch.id);
              batch.update(roomRef, {
                status: "Available",
                maintenanceStatus: "Operational"
              });
            }
          }
        }
      }

      batch.update(ticketRef, updateData);
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `maintenance/${ticketId}`);
    }
  };

  // Notification actions
  const handleDismissNotification = async (notifId: string) => {
    if (user?.uid === "sandbox-mode") {
      const updatedNotifs = notifications.map(n => n.id === notifId ? { ...n, read: true } : n);
      setNotifications(updatedNotifs);
      localStorage.setItem("lumina_notifications", JSON.stringify(updatedNotifs));
      return;
    }

    try {
      const notifRef = doc(db, "notifications", notifId);
      await updateDoc(notifRef, { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${notifId}`);
    }
  };

  const handleClearAllNotifications = async () => {
    if (user?.uid === "sandbox-mode") {
      setNotifications([]);
      localStorage.setItem("lumina_notifications", JSON.stringify([]));
      return;
    }

    try {
      const batch = writeBatch(db);
      notifications.forEach((notif) => {
        const notifRef = doc(db, "notifications", notif.id);
        batch.delete(notifRef);
      });
      await batch.commit();
      setNotifications([]);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, "notifications");
    }
  };

  const handleOptimizeRevenue = async () => {
    try {
      if (user?.uid === "sandbox-mode") {
        const availableSuites = rooms.filter(r => r.status === "Available" && r.roomType === "Suite").length;
        const arrivalsCount = guests.filter(g => g.status === "Reserved").length;
        const upsellRev = arrivalsCount * 1500 + availableSuites * 5000;
        
        const generatedReport = {
          upgradeOpportunities: availableSuites,
          upsellRevenue: upsellRev,
          recommendations: [
            `Upsell premium suites (e.g., Suite 302/304) to incoming scheduled check-ins for a +₹5,000/night premium rate.`,
            `Auto-dispatch pre-arrival SMS proposing private Spa access at ₹1,500/session (Est: 4 arrivals will convert).`,
            `Offer early check-in options to arrivals arriving before 14:00 at a flat ₹1,000 housekeeping expedited fee.`
          ]
        };

        const newNotifId = `notif-${Date.now()}`;
        const newNotif: HotelNotification = {
          id: newNotifId,
          title: "AI Dynamic Upsell Audit",
          message: `Revenue Optimizer executed. Formulated +₹${upsellRev} in incremental premium upcharge opportunities.`,
          type: "success" as const,
          timestamp: new Date().toISOString(),
          read: false
        };

        const updatedNotifs = [newNotif, ...notifications];
        setNotifications(updatedNotifs);
        localStorage.setItem("lumina_notifications", JSON.stringify(updatedNotifs));

        const nextBonus = bonusRevenue + upsellRev;
        setBonusRevenue(nextBonus);
        localStorage.setItem("innsync_bonus_revenue", String(nextBonus));

        return {
          success: true,
          report: generatedReport,
          addedRevenue: upsellRev
        };
      }

      const response = await fetch("/api/hotel/revenue/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("Failed to trigger backend revenue optimization.");
      }
      const data = await response.json();
      if (data.success) {
        const nextBonus = bonusRevenue + data.addedRevenue;
        setBonusRevenue(nextBonus);
        localStorage.setItem("innsync_bonus_revenue", String(nextBonus));
        return data;
      }
    } catch (err) {
      console.error("Revenue optimization failed: ", err);
    }
    return null;
  };

  // Loading View
  if (authLoading) {
    return (
      <div id="loader-view" className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 font-sans space-y-4">
        <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-zinc-950 font-black font-mono text-lg animate-pulse shadow-md">
          L
        </div>
        <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
          Verifying Console Authorization...
        </div>
      </div>
    );
  }

  // Auth Protection Portal
  if (!user) {
    return <AuthPortal onAuthSuccess={handleAuthSuccess} />;
  }

  const activeNotifications = notifications.filter(n => !n.read);
  const healthScore = analytics?.operationalHealthScore || 100;
  const revenueToday = analytics?.revenueToday || 0;
  const activeComplaints = analytics?.activeComplaints || 0;

  return (
    <div id="hotel-app-root" className="min-h-screen bg-zinc-50/15 text-zinc-950 font-sans lg:pl-64 antialiased overflow-x-hidden relative">
      
      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div 
          id="sidebar-overlay-backdrop"
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION GRID LEFT */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setShowNotificationsPane(false);
          setSidebarOpen(false);
        }}
        operationalHealthScore={healthScore}
        activeNotificationsCount={activeNotifications.length}
        selectedProperty={selectedProperty}
        setSelectedProperty={setSelectedProperty}
        emergencyActive={emergencyActive}
        setEmergencyActive={setEmergencyActive}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* TOP HEADER STATUS ACTION PANEL */}
      <header id="top-header" className="sticky top-0 right-0 h-16 border-b border-zinc-200/80 bg-white/70 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-20">
        <div className="flex items-center gap-3">
          {/* Hamburger button for mobile/tablet */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-zinc-100 rounded-lg text-zinc-700 cursor-pointer transition-colors"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <span className="text-xs px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md font-extrabold tracking-wide uppercase flex items-center gap-1 leading-none font-mono">
            <Building2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="truncate max-w-[120px] sm:max-w-none">{selectedProperty} Node</span>
          </span>
        </div>

        {/* Action icons & Account card */}
        <div className="flex items-center gap-4">
          
          {/* Notifications button trigger */}
          <button
            id="notifications-bell-btn"
            ref={notificationsBellBtnRef}
            onClick={() => setShowNotificationsPane(!showNotificationsPane)}
            className="p-2 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 rounded-lg text-zinc-700 relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {activeNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          {/* User Profile log card */}
          <div className="flex items-center gap-2.5 pl-2.5 border-l border-zinc-200">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-zinc-900 leading-none">{userInfo?.name || "Roster Staff"}</span>
              <span className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wide">{userInfo?.role || "Staff"}</span>
            </div>
            <button
              id="logout-btn"
              onClick={handleLogout}
              title="Log Out From Console"
              className="p-2 hover:bg-zinc-50 text-zinc-400 hover:text-red-650 rounded-lg border border-transparent hover:border-zinc-200 cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* EMERGENCY SYSTEM OVERRIDE HEADER IF PANIC LEVEL ENGAGED */}
      {emergencyActive && (
        <div id="emergency-alert-banner" className="bg-red-600 text-white p-5 border-b border-red-700 animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-sans shadow-lg shadow-red-950/20">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 flex-shrink-0 animate-bounce text-white animate-pulse" />
            <div>
              <h2 className="text-sm font-black tracking-tight uppercase">Emergency Evacuation Overlay Triggered</h2>
              <p className="text-xs text-red-100 mt-0.5 leading-relaxed">
                Fire/Plumbing sensors active. All elevators governed automatically to Floor 1. Water drop mechanisms open. Technicians Sylvia and Marcus deployed on Floor level sweeping checklists.
              </p>
            </div>
          </div>
          <button
            onClick={() => setEmergencyActive(false)}
            className="px-3.5 py-2 bg-white text-red-700 hover:bg-zinc-50 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 leading-none shadow"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Mute Panic Alarm</span>
          </button>
        </div>
      )}

      {/* CORE VIEWPORT CONTENT SWITCHBOARD */}
      <main id="main-viewport-pane" className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="h-[50vh] flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-zinc-950 animate-spin" />
            <p className="text-xs font-mono text-zinc-400 tracking-wider">Syncing database changes...</p>
          </div>
        ) : (
          <>
            {currentTab === "dashboard" && (
              <Dashboard
                rooms={rooms}
                tickets={tickets}
                guests={guests}
                staff={staff}
                notifications={notifications}
                revenueToday={revenueToday}
                operationalHealthScore={healthScore}
                activeComplaints={activeComplaints}
                onCheckin={handleCheckin}
                onCheckout={handleCheckout}
                onAddTicket={handleAddTicket}
                onOptimizeRevenue={handleOptimizeRevenue}
                financials={financials}
              />
            )}

            {currentTab === "rooms" && (
              <Rooms
                rooms={rooms}
                guests={guests}
                staff={staff}
                onUpdateRoomStatus={handleUpdateRoomStatus}
                onCheckout={handleCheckout}
                onAssignHousekeeping={handleAssignHousekeeping}
                onForceAvailable={handleForceAvailable}
                selectedProperty={selectedProperty}
                setSelectedProperty={setSelectedProperty}
              />
            )}

            {currentTab === "housekeeping" && (
              <Housekeeping
                rooms={rooms}
                staff={staff}
                onCompleteCleaning={handleForceAvailable}
                onAssignHousekeeping={handleAssignHousekeeping}
                onAddTicket={handleAddTicket}
              />
            )}

            {currentTab === "maintenance" && (
              <Maintenance
                tickets={tickets}
                onUpdateTicketStatus={handleUpdateTicketStatus}
                onAddTicket={handleAddTicket}
              />
            )}

            {currentTab === "guests" && (
              <Guests
                guests={guests}
              />
            )}

            {currentTab === "staff" && (
              <Staff
                staff={staff}
              />
            )}

            {currentTab === "ai-assistant" && (
              <AISuggestions
                onAddTicket={handleAddTicket}
              />
            )}

            {currentTab === "analytics" && (
              <Analytics
                analytics={analytics}
                rooms={rooms}
              />
            )}

            {currentTab === "settings" && (
              <Settings
                selectedProperty={selectedProperty}
                setSelectedProperty={setSelectedProperty}
                emergencyActive={emergencyActive}
                setEmergencyActive={setEmergencyActive}
                onAddTicket={handleAddTicket}
              />
            )}
          </>
        )}
      </main>

      {/* AUTOMATED FLOATING NOTIFICATIONS TOAST BAR EXPEDITION */}
      {showNotificationsPane && (
        <div 
          id="notifications-shelf animate-slide-in text-zinc-950 bg-white border-l border-zinc-200" 
          ref={notificationsShelfRef}
          className="bg-white shadow-2xl p-5 h-[calc(100vh-4rem)] max-w-sm w-full fixed top-16 right-0 z-45 overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-150">
            <span className="text-xs font-bold text-zinc-805 uppercase tracking-wider flex items-center gap-1.5 font-sans">
              <Bell className="w-4 h-4 text-zinc-500 animate-pulse" />
              <span>Real-Time Operation Log</span>
            </span>
            <button
              onClick={handleClearAllNotifications}
              className="text-[10px] font-mono font-black text-amber-600 hover:text-amber-800 uppercase cursor-pointer"
            >
              Clear Logs
            </button>
          </div>

          <div className="space-y-3.5 pt-4">
            {notifications.length === 0 ? (
              <p className="text-xs text-zinc-400 font-mono text-center py-6">Audit log registers empty.</p>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-3 p-y-2.5 rounded-lg border text-xs relative ${
                    notif.read ? 'bg-zinc-50/50 border-zinc-100 text-zinc-400' : 
                    notif.type === 'danger' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                    notif.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                    'bg-zinc-50 border-zinc-200 text-zinc-800'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-extrabold text-zinc-900 block">{notif.title}</span>
                    <p className="leading-relaxed text-zinc-600">{notif.message}</p>
                    <span className="text-[9px] text-zinc-400 font-mono block">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {!notif.read && (
                    <button
                      title="Mark Read"
                      onClick={() => handleDismissNotification(notif.id)}
                      className="absolute top-2.5 right-2.5 p-0.5 rounded text-zinc-400 hover:text-zinc-650 cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
