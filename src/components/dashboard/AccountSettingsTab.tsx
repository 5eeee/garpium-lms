"use client";

import { useEffect, useState } from "react";
import { PersonalDataTab, type PersonalUser } from "@/components/dashboard/PersonalDataTab";
import { AccountVerificationStatus } from "@/components/dashboard/AccountVerificationStatus";
import { applyLmsTheme, getStoredTheme, type LmsTheme } from "@/lib/lms-theme";

export function AccountSettingsTab({ user }: { user: PersonalUser }) {
  const [theme, setTheme] = useState<LmsTheme>("light");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  function selectTheme(next: LmsTheme) {
    setTheme(next);
    applyLmsTheme(next);
  }

  return (
    <div className="account-panel account-panel--settings">
      <section className="settings-theme-card">
        <span className="dash-card__label">Оформление</span>
        <h2>Тема интерфейса</h2>
        <div className="settings-theme">
          <button
            className={`settings-theme__btn${theme === "light" ? " is-active" : ""}`}
            type="button"
            onClick={() => selectTheme("light")}
          >
            Светлая
          </button>
          <button
            className={`settings-theme__btn${theme === "dark" ? " is-active" : ""}`}
            type="button"
            onClick={() => selectTheme("dark")}
          >
            Тёмная
          </button>
        </div>
      </section>

      <section className="settings-contacts-full">
        <div className="settings-contacts-full__head">
          <span className="dash-card__label">Личные данные</span>
          <h2>Контакты и безопасность</h2>
        </div>
        <AccountVerificationStatus user={user} />
        <PersonalDataTab user={user} embedded />
      </section>
    </div>
  );
}
