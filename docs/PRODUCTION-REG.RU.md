# Production на REG.RU — GARPIUM LMS

Домен: **https://lms.garpium.com**  
Сервер: **37.140.192.112** (REG.RU, ISPmanager, аккаунт `u3527238`)

На аккаунте уже есть домены: **garpium.com**, **garpium.store**.

> **Важно:** пароли из чата **смените** после деплоя.  
> **Не храните** пароли в git — только в `.env` на сервере.

---

## Что выяснили про ваш сервер

| Параметр | Значение |
|----------|----------|
| Тип | Shared hosting (не полный VPS) |
| SSH | `u3527238@37.140.192.112` ✅ работает |
| root SSH | ❌ пароль не принимается |
| Docker | ❌ нет доступа |
| Node системный | v10 (слишком старый) |
| Node через nvm | ✅ v20 установлен |
| MySQL | есть, но LMS нужен **PostgreSQL** |

**Вывод:** PostgreSQL ставим **облачный** (Neon — бесплатно), приложение — на хостинг через Node 20.

---

## Шаг 1. DNS — поддомен lms.garpium.com

1. [DNS REG.RU](https://dnsadmin.hosting.reg.ru/manager/ispmgr) → зона **garpium.com**
2. Добавьте:

| Тип | Имя | Значение |
|-----|-----|----------|
| **A** | `lms` | `37.140.192.112` |

---

## Шаг 2. PostgreSQL в облаке (Neon)

1. Зарегистрируйтесь на [neon.tech](https://neon.tech) (бесплатный tier)
2. Создайте проект `garpium-lms`
3. Скопируйте **Connection string** (PostgreSQL):

```
postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

Это будет `DATABASE_URL` в `.env`.

---

## Шаг 3. Поддомен в ISPmanager

1. [Панель ISPmanager](https://server62.hosting.reg.ru:1500/) → логин `u3527238`
2. **WWW-домены** → **Создать**
3. Имя: `lms.garpium.com`
4. Корневая папка: `/var/www/u3527238/data/www/lms.garpium.com`
5. Включите **SSL Let's Encrypt**

---

## Шаг 4. Загрузка проекта

**WinSCP / FileZilla:**
- Host: `37.140.192.112`
- User: `u3527238`
- Путь: `/var/www/u3527238/data/garpium-lms`

Или архив (PowerShell на вашем ПК):

```powershell
cd "c:\Users\vladi\Работа\exemple\HTML\project 2"
tar -czf $env:TEMP\lms-deploy.tgz --exclude=node_modules --exclude=.next .
```

Загрузите через SFTP в `~/garpium-lms/` и распакуйте.

---

## Шаг 5. `.env` на сервере

SSH:

```bash
ssh u3527238@37.140.192.112
cd ~/garpium-lms
cp deploy/env.production.example .env
nano .env
```

```env
DOMAIN=lms.garpium.com
NEXTAUTH_URL=https://lms.garpium.com
NEXT_PUBLIC_APP_URL=https://lms.garpium.com

NEXTAUTH_SECRET=сгенерируйте-openssl-rand-base64-32

# Neon PostgreSQL:
DATABASE_URL=postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require
```

---

## Шаг 6. Деплой (shared hosting)

```bash
cd ~/garpium-lms
chmod +x deploy/setup-shared-hosting.sh
bash deploy/setup-shared-hosting.sh
```

Скрипт: Node 20, сборка, миграции, PM2 на порту 3000, proxy через `.htaccess`.

---

## Шаг 7. Проверка

| URL | Ожидание |
|-----|----------|
| https://lms.garpium.com/login | Экран входа |
| https://lms.garpium.com/admin | Админка |

**Логины:**

| Email | Пароль |
|-------|--------|
| admin@example.com | admin12345 |
| student@example.com | student12345 |

---

## Альтернатива: VPS + Docker (если купите VPS)

Если получите VPS с root-доступом — используйте Docker:

```bash
cd /opt/garpium-lms
bash deploy/setup-server.sh
bash deploy/enable-ssl.sh lms.garpium.com
```

---

## OAuth / API-ключи — после production

1. OAuth → `docs/OAUTH-SSO.md`, ключи в `.env`
2. API для партнёров → позже, `/admin/api`

---

## Безопасность

1. **Смените все пароли**, которые были в чате
2. Смените `admin12345` на production
3. Не публикуйте `.env`

---

## Логи

```bash
pm2 logs garpium-lms
pm2 restart garpium-lms
```

---

*GARPIUM LMS · Production REG.RU · 2026*
