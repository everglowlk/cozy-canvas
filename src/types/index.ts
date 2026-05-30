export interface IEvent {
  _id?: string;
  eventId: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  priceLKR: number;
  priceUSD: number;
  status: "draft" | "open" | "closed" | "past";
  createdAt: string;
}

export interface IRegistration {
  _id?: string;
  eventId: string;
  regId: string;
  name: string;
  email: string;
  phone: string;
  nic: string;
  country: "local" | "foreign";
  guests: number;
  tier: "Painter";
  payMethod: string;
  payRef: string;
  amount: number;
  currency: "LKR" | "USD";
  receiptUrl: string;
  receiptPublicId: string;
  status: "pending" | "approved" | "rejected";
  ticket: string | null;
  notes: string;
  checkedIn: boolean;
  checkedInAt: Date | null;
  checkedInBy: string | null;
  decidedAt: Date | null;
  createdAt: Date;
}

export interface IAdmin {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "Organizer" | "Door staff";
  addedAt: Date;
}

export interface StatsResult {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  revenueLKR: number;
  seats: number;
  checkedIn: number;
  seatCap: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "Organizer" | "Door staff";
}

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
  interface User extends SessionUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
