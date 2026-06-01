# Настройка входа: соцсети, банки и SSO

Инструкция по подключению Google, Яндекс, VK, **T-Bank (T-ID)** и **Сбер ID** для входа и регистрации на GARPIUM LMS.

Production: **https://lms.garpium.com**

---

## Общие требования

В `.env` на сервере (`/opt/garpium-lms/deploy/.env.production`):

```env
NEXTAUTH_SECRET="длинная-случайная-строка-32+символов"
NEXTAUTH_URL="https://lms.garpium.com"
NEXT_PUBLIC_APP_URL="https://lms.garpium.com"
```

**Redirect URI** для всех провайдеров:

```
https://lms.garpium.com/api/auth/callback/{provider-id}
```

| Провайдер | provider-id | Redirect URI |
|-----------|-------------|--------------|
| Google | `google` | `.../api/auth/callback/google` |
| Яндекс | `yandex` | `.../api/auth/callback/yandex` |
| VK | `vk` | `.../api/auth/callback/vk` |
| T-Bank | `tbank` | `.../api/auth/callback/tbank` |
| Сбер ID | `sberbank` | `.../api/auth/callback/sberbank` |

Кнопки появляются **только** если заполнены ключи в `.env`. После изменения `.env` перезапустите контейнер:

```bash
cd /opt/garpium-lms
docker compose -f deploy/docker-compose.vps.yml up -d --force-recreate app
```

---

## 1. Google

1. [Google Cloud Console](https://console.cloud.google.com/) → Credentials → OAuth Client ID → Web
2. Redirect URI: `https://lms.garpium.com/api/auth/callback/google`

```env
GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxxx"
```

---

## 2. Яндекс

1. [oauth.yandex.ru](https://oauth.yandex.ru/) → приложение → «Веб-сервисы»
2. Redirect URI: `https://lms.garpium.com/api/auth/callback/yandex`
3. Права: `login:email`, `login:info`

```env
YANDEX_CLIENT_ID="xxxx"
YANDEX_CLIENT_SECRET="xxxx"
```

---

## 3. VK (VK ID)

1. [id.vk.com](https://id.vk.com/) → **VK ID** → Web-приложение
2. Базовый домен: `lms.garpium.com`
3. Redirect URI: `https://lms.garpium.com/api/auth/callback/vk`
4. Включите доступ к **email**

```env
VK_CLIENT_ID="xxxx"
VK_CLIENT_SECRET="xxxx"
```

---

## 4. T-Bank (T-ID)

Единый вход через аккаунт T-Bank. Работает по OAuth 2.0 / OpenID Connect.

### Регистрация приложения

1. Подайте заявку: [developer.tbank.ru](https://developer.tbank.ru/docs/products/TID/) или напишите на **tid@tbank.ru**
2. Укажите: компанию, сайт `https://lms.garpium.com`, продукт **T-ID**
3. После одобления получите `client_id` и `client_secret`
4. Зарегистрируйте Redirect URI: `https://lms.garpium.com/api/auth/callback/tbank`

### Переменные окружения

```env
TBANK_CLIENT_ID="ваш_client_id"
TBANK_CLIENT_SECRET="ваш_client_secret"
```

### Как работает для пользователя

- Нажимает **«Войти через T-Bank»** на `/login` или `/register`
- Авторизуется в T-Bank (SMS / приложение)
- Если аккаунта в LMS нет — создаётся автоматически (статус «ожидает одобрения»)
- Админ одобряет в `/admin` или включите auto-approve через SSO компании

---

## 5. Сбер ID

Вход и регистрация через Сбер ID (OAuth 2.0 + PKCE + mTLS для обмена токена).

### Регистрация приложения

1. [developers.sber.ru](https://developers.sber.ru/) → Сбер ID → создайте приложение
2. Redirect URI (без GET-параметров): `https://lms.garpium.com/api/auth/callback/sberbank`
3. Scopes: `openid`, `email`, `name`
4. Скачайте **клиентский сертификат** (.pem / .crt + .key) — нужен для запроса токена

### Переменные окружения

**Вариант A — файлы на сервере (рекомендуется для Docker):**

```env
SBERBANK_CLIENT_ID="DA5278AC-A07F-C01A-B2D3-C231DBB2E20F"
SBERBANK_CLIENT_SECRET="ваш_secret"
SBERBANK_CLIENT_CERT_PATH="/opt/garpium-lms/deploy/certs/sber-client.crt"
SBERBANK_CLIENT_KEY_PATH="/opt/garpium-lms/deploy/certs/sber-client.key"
```

Смонтируйте папку с сертификатами в `docker-compose.vps.yml` или положите файлы в `/opt/garpium-lms/deploy/certs/`.

**Вариант B — PEM прямо в .env:**

```env
SBERBANK_CLIENT_CERT="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
SBERBANK_CLIENT_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### Тестовый стенд (опционально)

```env
SBERBANK_AUTH_URL="https://id-ift.sber.ru/CSAFront/oidc/authorize.do"
SBERBANK_TOKEN_URL="https://oauth-ift.sber.ru/ru/prod/tokens/v2/oidc"
SBERBANK_USERINFO_URL="https://oauth-ift.sber.ru/ru/prod/sberbankid/v2.1/userinfo"
```

---

## 6. SSO отдельно для каждой компании (опционально)

В БД у `Company` можно включить свой OIDC IdP (Keycloak и т.д.) — см. поля `ssoEnabled`, `ssoIssuer`, `ssoClientId`, `ssoClientSecret`.

Redirect URI: `https://lms.garpium.com/api/auth/callback/sso-{slug}`

---

## 7. Проверка

```bash
curl https://lms.garpium.com/api/auth/available-providers
```

Откройте `https://lms.garpium.com/login` — должны появиться настроенные кнопки.

---

## 8. Пароли (email/пароль)

| Email | Пароль | Роль |
|-------|--------|------|
| `admin@example.com` | `admin12345` | Админ |
| `student@example.com` | `student12345` | Ученик |
| `pending@example.com` | `pending12345` | Ожидает одобрения |

---

## 9. Частые ошибки

| Симптом | Решение |
|---------|---------|
| Кнопки банков не видны | Пустые переменные в `.env` или нет сертификата Сбера |
| `OAuthCallback` | Redirect URI не совпадает с настройками в кабинете банка |
| Sber: ошибка токена | Проверьте client cert/key и `rquid`; cert должен быть от Сбер ID |
| T-Bank: access denied | Заявка не одоблена или неверный redirect URI |
| Пользователь в `/pending` | Одобрите в `/admin` |

---

*GARPIUM LMS · OAuth · 2026*
