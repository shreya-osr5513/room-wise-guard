/**
 * Service / API abstraction layer.
 *
 * Every screen talks ONLY to the functions exported here. Today they resolve
 * against an in-memory mock store; later each function body can be swapped for
 * a `fetch()` against the real backend that receives ESP32 (Wokwi) telemetry —
 * no UI component has to change.
 *
 * Example future implementation:
 *   export const getRooms = () => http<Room[]>("/api/rooms");
 */
import type {
  ActivityEntry,
  Alert,
  AlertStatus,
  EnergyStats,
  OverviewStats,
  Recommendation,
  Room,
  RoomMode,
  User,
} from "@/lib/types";
import {
  mockActivity,
  mockAlerts,
  mockRecommendations,
  mockRooms,
  mockWeekly,
} from "./mockData";

const LATENCY = 220;
const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/* ------------------------------ in-memory db ----------------------------- */

const db = {
  rooms: clone(mockRooms),
  alerts: clone(mockAlerts),
  activity: clone(mockActivity),
};

let seq = 1000;
const nextId = () => `x-${++seq}`;

function log(entry: Omit<ActivityEntry, "id" | "createdAt">) {
  db.activity.unshift({
    ...entry,
    id: nextId(),
    createdAt: new Date().toISOString(),
  });
}

function touch(room: Room) {
  room.lastUpdated = new Date().toISOString();
}

/* --------------------------------- auth ---------------------------------- */

export async function login(email: string, password: string): Promise<User> {
  if (!email.trim() || password.length < 4) {
    throw new Error("Enter a valid email and a password of at least 4 characters.");
  }
  return delay<User>({
    id: "u-1",
    name: email.split("@")[0]?.replace(/\W/g, " ") || "Facility Manager",
    email,
    role: email.startsWith("admin") ? "Admin" : "Facility Manager",
  });
}

/* --------------------------------- rooms --------------------------------- */

export const getRooms = () => delay(clone(db.rooms));

export const getRoom = (id: string) =>
  delay(clone(db.rooms.find((r) => r.id === id)) ?? null);

export async function setAppliance(
  roomId: string,
  appliance: "fan" | "light",
  value: boolean,
): Promise<Room> {
  const room = db.rooms.find((r) => r.id === roomId);
  if (!room) throw new Error("Room not found");
  room[appliance] = value;
  touch(room);
  log({
    roomId,
    roomNumber: room.number,
    type: "appliance",
    message: `${appliance === "fan" ? "Fan" : "Light"} turned ${value ? "ON" : "OFF"} in Room ${room.number}`,
  });
  return delay(clone(room));
}

export async function turnAllOff(roomId: string): Promise<Room> {
  const room = db.rooms.find((r) => r.id === roomId);
  if (!room) throw new Error("Room not found");
  room.fan = false;
  room.light = false;
  touch(room);
  log({
    roomId,
    roomNumber: room.number,
    type: "appliance",
    message: `All appliances turned OFF in Room ${room.number}`,
  });
  db.alerts
    .filter((a) => a.roomId === roomId && a.type === "energy" && a.status === "active")
    .forEach((a) => {
      a.status = "resolved";
    });
  return delay(clone(room));
}

export async function setRoomMode(roomId: string, mode: RoomMode): Promise<Room> {
  const room = db.rooms.find((r) => r.id === roomId);
  if (!room) throw new Error("Room not found");
  room.mode = mode;
  touch(room);
  log({
    roomId,
    roomNumber: room.number,
    type: "system",
    message: `Room ${room.number} switched to ${mode} mode`,
  });
  return delay(clone(room));
}

export async function setEmptyDelay(
  roomId: string,
  minutes: 5 | 10 | 15,
): Promise<Room> {
  const room = db.rooms.find((r) => r.id === roomId);
  if (!room) throw new Error("Room not found");
  room.emptyDelayMinutes = minutes;
  touch(room);
  log({
    roomId,
    roomNumber: room.number,
    type: "system",
    message: `Empty-room delay for Room ${room.number} set to ${minutes} minutes`,
  });
  return delay(clone(room));
}

/* --------------------------------- alerts -------------------------------- */

export const getAlerts = () => delay(clone(db.alerts));

export async function setAlertStatus(
  alertId: string,
  status: AlertStatus,
): Promise<Alert> {
  const alert = db.alerts.find((a) => a.id === alertId);
  if (!alert) throw new Error("Alert not found");
  alert.status = status;
  log({
    roomId: alert.roomId,
    roomNumber: alert.roomNumber,
    type: "alert",
    message: `Alert for Room ${alert.roomNumber} marked ${status}`,
  });
  return delay(clone(alert));
}

/* -------------------------------- activity ------------------------------- */

export const getActivity = () => delay(clone(db.activity));

/* --------------------------------- energy -------------------------------- */

export async function getEnergyStats(): Promise<EnergyStats> {
  const runtime = db.rooms.slice(0, 6).map((r, i) => ({
    room: `Room ${r.number}`,
    fanHours: Number((4 + ((i * 1.7) % 5)).toFixed(1)),
    lightHours: Number((5 + ((i * 2.3) % 4)).toFixed(1)),
  }));
  return delay<EnergyStats>({
    estimatedSavedKwh: 36.4,
    estimatedSavedCost: 291,
    wastageEvents: db.alerts.filter((a) => a.type === "energy").length,
    wastageMinutes: 142,
    applianceRuntime: runtime,
    weekly: clone(mockWeekly),
  });
}

/* ------------------------------ recommendations --------------------------- */

export const getRecommendations = (): Promise<Recommendation[]> =>
  delay(clone(mockRecommendations));

/* -------------------------------- overview ------------------------------- */

export function computeOverview(rooms: Room[], alerts: Alert[]): OverviewStats {
  const occupied = rooms.filter((r) => r.occupied).length;
  const online = rooms.filter((r) => r.online).length;
  const energyAlerts = alerts.filter(
    (a) => a.type === "energy" && a.status === "active",
  ).length;
  const activeCritical = alerts.filter(
    (a) => a.status === "active" && a.severity === "high",
  ).length;
  const avg = rooms.length
    ? rooms.reduce((s, r) => s + r.temperature, 0) / rooms.length
    : 0;
  return {
    totalRooms: rooms.length,
    occupiedRooms: occupied,
    emptyRooms: rooms.length - occupied,
    energyAlerts,
    averageTemperature: Number(avg.toFixed(1)),
    devicesOnline: online,
    devicesOffline: rooms.length - online,
    buildingStatus:
      activeCritical > 1 ? "critical" : activeCritical > 0 ? "attention" : "optimal",
  };
}
