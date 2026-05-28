/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "./firebase";
import { 
  INITIAL_ROOMS, 
  INITIAL_TICKETS, 
  INITIAL_GUESTS, 
  INITIAL_STAFF, 
  INITIAL_NOTIFICATIONS 
} from "./data";

export async function seedDatabaseIfEmpty() {
  try {
    const roomsSnap = await getDocs(collection(db, "rooms"));
    if (!roomsSnap.empty) {
      console.log("Database already seeded with data. Skipping bootstrap.");
      return;
    }

    console.log("Database is empty. Initiating professional hotel bootstrap seeder...");

    // Seeding Rooms
    const roomsBatch = writeBatch(db);
    for (const room of INITIAL_ROOMS) {
      const docRef = doc(db, "rooms", room.id);
      roomsBatch.set(docRef, room);
    }
    await roomsBatch.commit();
    console.log("Rooms collection populated.");

    // Seeding Guests
    const guestsBatch = writeBatch(db);
    for (const guest of INITIAL_GUESTS) {
      const docRef = doc(db, "guests", guest.id);
      guestsBatch.set(docRef, guest);
    }
    await guestsBatch.commit();
    console.log("Guests collection populated.");

    // Seeding Staff
    const staffBatch = writeBatch(db);
    for (const staff of INITIAL_STAFF) {
      const docRef = doc(db, "staff", staff.id);
      staffBatch.set(docRef, staff);
    }
    await staffBatch.commit();
    console.log("Staff collection populated.");

    // Seeding Maintenance Tickets
    const maintBatch = writeBatch(db);
    for (const ticket of INITIAL_TICKETS) {
      const docRef = doc(db, "maintenance", ticket.id);
      maintBatch.set(docRef, ticket);
    }
    await maintBatch.commit();
    console.log("Maintenance Tickets collection populated.");

    // Seeding Notifications
    const notifBatch = writeBatch(db);
    for (const notif of INITIAL_NOTIFICATIONS) {
      const docRef = doc(db, "notifications", notif.id);
      notifBatch.set(docRef, notif);
    }
    await notifBatch.commit();
    console.log("Notifications collection populated.");

    // Seeding initial financials metrics document
    const finDocRef = doc(db, "financials", "today");
    const financialsBatch = writeBatch(db);
    financialsBatch.set(finDocRef, {
      todayRevenue: 1254700,
      avgDailyRate: 16500,
      revpar: 12500,
      growthPercentage: 12.4
    });
    await financialsBatch.commit();
    console.log("Financials metrics collection primed.");

    console.log("Hospitality SaaS Bootstrap Database populated successfully!");
  } catch (error) {
    console.error("Critical error seeding Firestore: ", error);
  }
}
