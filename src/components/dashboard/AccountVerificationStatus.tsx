"use client";

import { IconCheck, IconMail, IconPhone } from "@/components/ui/LmsIcon";
import { GosuslugiLogo } from "@/components/ui/GosuslugiLogo";
import type { PersonalUser } from "@/components/dashboard/PersonalDataTab";

function Badge({
  ok,
  label,
  icon
}: {
  ok: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <span className={`account-verify-badge${ok ? " is-ok" : ""}`}>
      <span className="account-verify-badge__icon">{icon}</span>
      <span>{label}</span>
      {ok ? (
        <span className="account-verify-badge__mark" title="Подтверждено">
          <IconCheck size={12} />
        </span>
      ) : null}
    </span>
  );
}

export function AccountVerificationStatus({ user }: { user: PersonalUser }) {
  const emailOk = !!user.emailVerifiedAt;
  const phoneOk = !!user.phoneVerifiedAt;
  const esiaOk = !!user.esiaVerifiedAt;
  const allOk = emailOk && phoneOk && esiaOk;

  return (
    <div className={`account-verify-status${allOk ? " is-complete" : ""}`}>
      <div className="account-verify-status__head">
        {allOk ? <IconCheck size={20} /> : null}
        <div>
          <strong>{allOk ? "Ваш аккаунт подтверждён" : "Подтвердите аккаунт"}</strong>
          <p>
            {allOk
              ? "Email, телефон и личность проверены — полный доступ к функциям платформы."
              : "Завершите проверку контактов и личности для полного доступа."}
          </p>
        </div>
      </div>
      <div className="account-verify-badges">
        <Badge icon={<IconMail size={14} />} label="Email" ok={emailOk} />
        <Badge icon={<IconPhone size={14} />} label="Телефон" ok={phoneOk} />
        <Badge icon={<GosuslugiLogo size={20} />} label="Госуслуги" ok={esiaOk} />
      </div>
    </div>
  );
}
