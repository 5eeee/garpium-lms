import Link from "next/link";

const messages: Record<string, string> = {
  Configuration: "OAuth не настроен. Проверьте ключи в .env (см. docs/OAUTH-SSO.md).",
  AccessDenied: "Доступ запрещён. Возможно, email не подтверждён у провайдера.",
  Verification: "Ссылка для входа устарела.",
  OAuthSignin: "Ошибка запуска OAuth. Проверьте Client ID и Redirect URI.",
  OAuthCallback: "Ошибка callback. Redirect URI должен совпадать с настройками провайдера.",
  OAuthCreateAccount: "Не удалось создать аккаунт.",
  Callback: "Ошибка callback авторизации.",
  Default: "Не удалось войти. Попробуйте email/пароль или другой способ."
};

export default async function AuthErrorPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const text = (error && messages[error]) || messages.Default;

  return (
    <div className="auth-page">
      <div className="auth-page__inner">
        <section className="auth-panel auth-panel--login">
          <header className="auth-panel__head">
            <span className="auth-panel__kicker">Ошибка</span>
            <h1 className="auth-panel__title">Вход не выполнен</h1>
            <p className="auth-panel__lead">{text}</p>
            {error ? <p className="auth-oauth-hint">Код: {error}</p> : null}
          </header>
          <div className="auth-card">
            <Link className="auth-submit" href="/login" style={{ display: "inline-flex", textDecoration: "none", justifyContent: "center" }}>
              Вернуться ко входу
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
