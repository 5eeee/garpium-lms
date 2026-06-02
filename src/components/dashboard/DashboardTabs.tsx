"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCamera } from "@/components/ui/LmsIcon";
import { AvatarCropModal } from "@/components/dashboard/AvatarCropModal";
import type { DashboardTab } from "@/components/dashboard/dashboard-types";

export type { DashboardTab };

const TABS: { id: DashboardTab; label: string }[] = [
  { id: "progress", label: "Главная" },
  { id: "company", label: "Моя компания" },
  { id: "courses", label: "Обучение" },
  { id: "settings", label: "Настройки" }
];

const LEGACY_TAB: Record<string, DashboardTab> = {
  personal: "settings"
};

function initials(first: string, last: string) {
  return `${first[0] || ""}${last[0] || ""}`.toUpperCase() || "?";
}

function formatDisplayName(first: string, last: string, middle: string | null) {
  if (middle) return `${first} ${middle} ${last}`;
  return `${first} ${last}`;
}

export function DashboardTabs({
  tab: initialTab,
  firstName,
  lastName,
  middleName,
  avatarUrl: initialAvatar,
  progressPanel,
  coursesPanel,
  companyPanel,
  settingsPanel
}: {
  tab: DashboardTab;
  firstName: string;
  lastName: string;
  middleName: string | null;
  avatarUrl: string | null;
  progressPanel: React.ReactNode;
  coursesPanel: React.ReactNode;
  companyPanel: React.ReactNode;
  settingsPanel: React.ReactNode;
}) {
  const [tab, setTab] = useState<DashboardTab>(initialTab);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [uploading, setUploading] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setAvatarUrl(initialAvatar);
  }, [initialAvatar]);

  useEffect(() => {
    const raw = window.location.hash.replace("#", "");
    const mapped = (LEGACY_TAB[raw] ?? raw) as DashboardTab;
    if (TABS.some((t) => t.id === mapped)) {
      setTab(mapped);
      if (raw !== mapped) {
        window.history.replaceState(null, "", `#${mapped}`);
      }
    }
  }, []);

  function selectTab(id: DashboardTab) {
    setTab(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  function onFileSelected(file: File | null) {
    if (!file) return;
    setCropFile(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function uploadCropped(blob: Blob) {
    setCropFile(null);
    setUploading(true);
    const form = new FormData();
    form.set("avatar", new File([blob], "avatar.jpg", { type: "image/jpeg" }));
    const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (res.ok) {
      setAvatarUrl(data.avatarUrl);
      router.refresh();
    }
  }

  return (
    <div className="account">
      <input
        ref={fileRef}
        accept="image/jpeg,image/png,image/webp"
        className="dash-hero__file"
        type="file"
        onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
      />

      {cropFile ? (
        <AvatarCropModal file={cropFile} onCancel={() => setCropFile(null)} onConfirm={uploadCropped} />
      ) : null}

      <header className="account-head">
        <div className="account-head__row">
          <button
            className="account-head__avatar"
            disabled={uploading}
            title="Изменить фото"
            type="button"
            onClick={() => fileRef.current?.click()}
          >
            <span className="account-head__avatar-inner">
              {avatarUrl ? <img alt="" src={avatarUrl} /> : initials(firstName, lastName)}
            </span>
            <span className="account-head__avatar-badge" aria-hidden>
              <IconCamera size={12} />
            </span>
          </button>

          <div className="account-head__name">
            <h1>{formatDisplayName(firstName, lastName, middleName)}</h1>
          </div>
        </div>
      </header>

      <nav className="account-tabs" aria-label="Разделы кабинета">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`account-tabs__item${tab === t.id ? " is-active" : ""}`}
            type="button"
            onClick={() => selectTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="account-body">
        {tab === "progress" ? progressPanel : null}
        {tab === "company" ? companyPanel : null}
        {tab === "courses" ? coursesPanel : null}
        {tab === "settings" ? settingsPanel : null}
      </div>
    </div>
  );
}
