"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CompanyMemberActions({
  memberId,
  currentRole,
  currentStatus
}: {
  memberId: string;
  currentRole: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(payload: Record<string, string>) {
    setLoading(true);
    await fetch(`/api/company/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="company-row-actions">
      <select
        defaultValue={currentRole}
        disabled={loading}
        onChange={(event) => update({ orgRole: event.target.value })}
      >
        <option value="COMPANY_EMPLOYEE">Сотрудник</option>
        <option value="COMPANY_MANAGER">Менеджер</option>
        <option value="COMPANY_ADMIN">Администратор</option>
      </select>
      <button
        className="course-button"
        disabled={loading}
        type="button"
        onClick={() => update({ status: currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED" })}
      >
        {currentStatus === "SUSPENDED" ? "Вернуть" : "Деактивировать"}
      </button>
    </div>
  );
}
