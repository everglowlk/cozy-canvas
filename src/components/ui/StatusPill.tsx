"use client";

interface StatusPillProps {
  status: "pending" | "approved" | "rejected";
}

export default function StatusPill({ status }: StatusPillProps) {
  const map = {
    pending: { cls: "pill-pending", label: "Pending" },
    approved: { cls: "pill-approved", label: "Approved" },
    rejected: { cls: "pill-rejected", label: "Rejected" },
  };

  const { cls, label } = map[status] || map.pending;

  return (
    <span className={`pill ${cls}`}>
      <span className="dot" />
      {label}
    </span>
  );
}
