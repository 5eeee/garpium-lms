"use client";

import { useState } from "react";

export function OrganizationVerificationActions({ organizationId }: { organizationId: string }) {
  const [loading, setLoading] = useState(false);

  async function update(status: "VERIFIED" | "REJECTED") {
    setLoading(true);
    await fetch(`/api/admin/platform/organizations/${organizationId}/verification`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    window.location.reload();
  }

  return (
    <span className="admin-actions">
      <button className="course-button is-primary" disabled={loading} onClick={() => update("VERIFIED")} type="button">
        Подтвердить
      </button>
      <button className="course-button" disabled={loading} onClick={() => update("REJECTED")} type="button">
        Отклонить
      </button>
    </span>
  );
}
