"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { AuthProviderInfo } from "@/lib/auth";
import { getPostLoginPath } from "@/lib/roles";

type AuthMode = "login" | "register";

async function redirectAfterAuth(router: ReturnType<typeof useRouter>) {
  const session = await getSession();
  router.push(
    getPostLoginPath({
      role: session?.user?.role,
      approvalStatus: session?.user?.approvalStatus
    })
  );
  router.refresh();
}

function BrandWall() {
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(3);
  const trackItems = 12;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      const w = el!.clientWidth;
      const next = Math.max(2, Math.min(5, Math.floor(w / 140)));
      setCols((prev) => (prev === next ? prev : next));
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div aria-hidden="true" className="auth-brand" ref={ref}>
      <div className="auth-brand__grid">
        {Array.from({ length: cols }).map((_, col) => (
          <div
            className={`auth-brand__col${col % 2 === 1 ? " auth-brand__col--reverse" : ""}`}
            key={col}
          >
            <div className="auth-brand__track">
              {Array.from({ length: trackItems * 2 }).map((_, i) => (
                <span className="auth-brand__word" key={i}>
                  GARPIUM LMS
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialOAuthBar({ providers }: { providers: AuthProviderInfo[] }) {
  if (!providers.length) return null;

  async function onOAuth(providerId: string) {
    await signIn(providerId, { callbackUrl: "/auth/complete" });
  }

  return (
    <div className="auth-social-bar">
      {providers.map((provider) => (
        <button
          aria-label={provider.label}
          className={`auth-social-bar__btn ${provider.className}`}
          key={provider.id}
          onClick={() => onOAuth(provider.id)}
          title={provider.label}
          type="button"
        >
          {provider.logo ? (
            <img alt="" aria-hidden="true" className="auth-social-bar__logo" src={provider.logo} />
          ) : (
            <span aria-hidden="true">{provider.icon}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function AuthHeader() {
  return (
    <header className="auth-header">
      <Link className="auth-header__brand" href="/" prefetch>
        <span className="auth-header__mark">
          <Image
            alt=""
            className="auth-header__mark-img"
            height={28}
            priority
            src="/garpium-mark.png"
            width={28}
          />
        </span>
        <span className="auth-header__title">Garpium LMS</span>
      </Link>
    </header>
  );
}

function AuthTabSwitcher<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div aria-label={label} className="auth-tabs" role="tablist">
      {options.map((option) => (
        <button
          aria-selected={value === option.id}
          className={`auth-tabs__btn${value === option.id ? " is-active" : ""}`}
          key={option.id}
          onClick={() => onChange(option.id)}
          role="tab"
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function AuthScreen({
  initialMode = "login",
  providers: initialProviders = []
}: {
  initialMode?: AuthMode;
  providers?: AuthProviderInfo[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (mode === "register") params.set("mode", "register");
    const qs = params.toString();
    router.replace(qs ? `/login?${qs}` : "/login", { scroll: false });
  }, [mode, router]);

  function resetMessages() {
    setError("");
    setMessage("");
  }

  function changeMode(next: AuthMode) {
    if (next === mode) return;
    resetMessages();
    setMode(next);
  }

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false
    });
    setLoading(false);
    if (result?.error) {
      setError("Не получилось войти. Проверьте email и пароль.");
      return;
    }
    await redirectAfterAuth(router);
  }

  async function onRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    resetMessages();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Не удалось создать аккаунт.");
      return;
    }
    setMessage(data.message || "Аккаунт создан. Войдите с email и паролем.");
    changeMode("login");
  }

  const socialProviders = initialProviders.filter((p) => p.kind === "social");
  const hasSocialOAuth = socialProviders.length > 0;
  const isLogin = mode === "login";

  const modeTabs = (
    <AuthTabSwitcher
      label="Режим"
      onChange={changeMode}
      options={[
        { id: "login", label: "Вход" },
        { id: "register", label: "Регистрация" }
      ]}
      value={mode}
    />
  );

  const loginForm = (
    <>
      <form className="auth-form" onSubmit={onLogin}>
        <label>
          Email
          <input name="email" type="email" maxLength={80} required placeholder="mail@example.com" />
        </label>
        <label>
          Пароль
          <input name="password" type="password" maxLength={72} required />
        </label>
        <button className="auth-submit" disabled={loading} type="submit">
          {loading ? "Проверяем..." : "Войти"}
        </button>
      </form>
      {error ? <p className="auth-message is-error">{error}</p> : null}
      {hasSocialOAuth ? (
        <>
          <div className="auth-divider">или</div>
          <SocialOAuthBar providers={socialProviders} />
        </>
      ) : null}
    </>
  );

  const registerForm = (
    <>
      <form className="auth-form auth-form--register" onSubmit={onRegister}>
        <div className="auth-form__row">
          <label>
            Имя
            <input name="firstName" maxLength={40} required placeholder="Иван" />
          </label>
          <label>
            Фамилия
            <input name="lastName" maxLength={40} required placeholder="Петров" />
          </label>
        </div>
        <label className="auth-form__full">
          Email
          <input name="email" type="email" maxLength={80} required placeholder="mail@example.com" />
        </label>
        <label className="auth-form__full">
          Пароль
          <input name="password" type="password" minLength={8} maxLength={72} required />
        </label>
        <button className="auth-submit auth-form__full" disabled={loading} type="submit">
          {loading ? "Создаём..." : "Создать аккаунт"}
        </button>
      </form>
      {message ? <p className="auth-message">{message}</p> : null}
      {error ? <p className="auth-message is-error">{error}</p> : null}
      {hasSocialOAuth ? (
        <>
          <div className="auth-divider">или</div>
          <SocialOAuthBar providers={socialProviders} />
        </>
      ) : null}
    </>
  );

  return (
    <div className={`is-auth${!isLogin ? " is-auth--register" : ""}`}>
      <main className="auth-shell">
        <div className="auth-top">
          <AuthHeader />
          <Link className="auth-home-link" href="/" prefetch>
            На главную курса
          </Link>
        </div>

        <div className="auth-viewport">
          <div className="auth-track">
            <section aria-hidden={!isLogin} className="auth-segment auth-segment--form">
              <div className="auth-form-side__inner">
                {modeTabs}
                <h1 className="auth-card__title">Вход</h1>
                <div className="auth-form-panel" key="login">
                  {loginForm}
                </div>
              </div>
            </section>

            <section aria-hidden="true" className="auth-segment auth-segment--brand">
              <BrandWall />
            </section>

            <section aria-hidden="true" className="auth-segment auth-segment--brand">
              <BrandWall />
            </section>

            <section aria-hidden={isLogin} className="auth-segment auth-segment--form auth-segment--register">
              <div className="auth-form-side__inner">
                {modeTabs}
                <h1 className="auth-card__title">Регистрация</h1>
                <div className="auth-form-panel" key="register">
                  {registerForm}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
