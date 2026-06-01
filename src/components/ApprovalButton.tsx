"use client";

import { useState } from "react";

export function ApprovalButton({ userId }: { userId: string }) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(false);

  async function update(next: "APPROVED" | "REJECTED") {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/approval`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next })
    });
    setStatus(next === "APPROVED" ? "approved" : "rejected");
    setLoading(false);
  }

  if (status === "approved") return <strong>Одобрен</strong>;
  if (status === "rejected") return <strong>Отклонён</strong>;

  return (
    <span className="admin-actions">
      <button className="course-button is-primary" disabled={loading} onClick={() => update("APPROVED")} type="button">
        {loading ? "..." : "Одобрить"}
      </button>
      <button className="course-button" disabled={loading} onClick={() => update("REJECTED")} type="button">
        Отклонить
      </button>
    </span>
  );
}
