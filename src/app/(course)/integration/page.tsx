import Link from "next/link";

export default function IntegrationPage() {
  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Partner</span>
        <h1 className="course-title">Подключение LMS</h1>
        <p className="course-lead">
          Платформа для обучения сотрудников и студентов: готовые курсы или свои, ключи доступа, Partner API и
          white-label для вашей компании.
        </p>
      </header>

      <article className="lesson-card span-12 integration-doc">
        <h2>1. Что это</h2>
        <p className="lesson-text">
          GARPIUM LMS — платформа для обучения людей и команд: 120 уроков HTML/CSS, практика, личный кабинет,
          сертификат. Владелец компании регистрируется, получает код организации и подключает курсы — из каталога
          или собственные. Сотрудники входят по коду компании или ключам доступа и сразу попадают на назначенный
          курс.
        </p>
        <p className="lesson-text">
          Платформу можно встроить в свои продукты через Partner API. Оплата — разовая за компанию или по числу
          обучающихся. White-label: ваш бренд в шапке, подпись GARPIUM внизу.
        </p>

        <h2>2. Варианты подключения</h2>
        <ul className="lesson-text">
          <li>
            <strong>Поддомен</strong> — <code>acme.lms.garpium.com</code>, DNS CNAME на наш сервер
          </li>
          <li>
            <strong>Свой домен</strong> — <code>learn.acme.com</code> → полный white-label
          </li>
          <li>
            <strong>Partner API</strong> — забираете курсы/уроки в свою CRM или сайт
          </li>
          <li>
            <strong>PWA</strong> — сайт можно добавить на главный экран телефона через браузер
          </li>
        </ul>

        <h2>3. Partner API</h2>
        <p className="lesson-text">Заголовок авторизации для всех запросов:</p>
        <pre className="code-playground__input">Authorization: Bearer garp_xxxxxxxx</pre>

        <div className="integration-endpoints">
          <div className="integration-endpoint">
            <code>GET /api/v1/courses</code>
            <span>Курсы, модули, список уроков</span>
          </div>
          <div className="integration-endpoint">
            <code>GET /api/v1/lessons/{"{id}"}</code>
            <span>Полный контент урока</span>
          </div>
          <div className="integration-endpoint">
            <code>POST /api/v1/users</code>
            <span>Создание ученика из вашей системы</span>
          </div>
        </div>

        <h2>4. White-label</h2>
        <p className="lesson-text">
          На поддомене показывается ваш логотип и название. Параметры: subdomain, logoUrl, brandHtml,
          brandCss, showPoweredBy. Настраиваются администратором GARPIUM.
        </p>

        <h2>5. Поток пользователя</h2>
        <p className="lesson-text">
          Регистрация → ожидание одобрения → админ одобряет → кабинет → карта → уроки → сертификат.
        </p>

        <h2>6. OAuth и корпоративный SSO</h2>
        <p className="lesson-text">
          Полная инструкция по Google, Яндекс, VK, Azure AD и OIDC:{" "}
          <strong>docs/OAUTH-SSO.md</strong>
        </p>
        <pre className="code-playground__input">{`GOOGLE_CLIENT_ID=...
YANDEX_CLIENT_ID=...
OIDC_ISSUER=https://sso.company.com/realm
AZURE_AD_TENANT_ID=...`}</pre>

        <h2>7. Полная документация</h2>
        <p className="lesson-text">
          Подробный файл с примерами curl, DNS, env и чеклистом:{" "}
          <strong>docs/PODKLYUCHENIE.md</strong> в репозитории проекта.
        </p>
      </article>

      <footer className="course-footer">
        <Link className="course-button" href="/dashboard">
          ← Кабинет
        </Link>
        <Link className="course-button is-primary" href="/admin/api">
          API-ключи →
        </Link>
      </footer>
    </>
  );
}
