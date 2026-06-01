"use client";

import { useState } from "react";

export function JoinRequestActions({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false);

  async function update(status: "APPROVED" | "REJECTED") {
    setLoading(true);
    await fetch(`/api/company/join-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    window.location.reload();
  }

  return (
    <span className="admin-actions">
      <button className="course-button is-primary" disabled={loading} onClick={() => update("APPROVED")} type="button">
        Одобрить
      </button>
      <button className="course-button" disabled={loading} onClick={() => update("REJECTED")} type="button">
        Отклонить
      </button>
    </span>
  );
}
