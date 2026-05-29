/**
 * Generate a ticket code in CC-XXXX-XX format
 * (4 alphanumeric + 2 digit number)
 */
export function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  const num = String(10 + Math.floor(Math.random() * 89));
  return `CC-${code}-${num}`;
}

/**
 * Generate a registration ID in REG-XXXXXX format
 * (6 alphanumeric)
 */
export function generateRegId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `REG-${id}`;
}

/**
 * Format money for display
 */
export function formatMoney(amount: number, currency: "LKR" | "USD"): string {
  if (currency === "USD") {
    return `$${amount}`;
  }
  return `LKR ${Number(amount).toLocaleString("en-US")}`;
}

/**
 * Time ago helper
 */
export function timeAgo(date: Date | string | number): string {
  const ts = typeof date === "number" ? date : new Date(date).getTime();
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
