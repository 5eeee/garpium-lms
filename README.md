# GARPIUM LMS — Corporate Learning OS

> **Полная техническая документация:** [docs/TECHNICAL.md](docs/TECHNICAL.md) · **GitHub:** [github.com/5eeee/garpium-lms](https://github.com/5eeee/garpium-lms)

Multi-tenant SaaS-платформа корпоративного обучения

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | Next.js (App Router), React, TypeScript |
| Backend | Next.js API Routes, Prisma 6 |
| БД | PostgreSQL |
| Auth | NextAuth + Prisma Adapter, bcryptjs, Zod |
| Deploy | Docker Compose prod, VPS |

## Возможности

### Multi-tenant
- Компании (Company), департаменты, приглашения
- RBAC: Employee, Manager, Admin, Instructor, Platform Admin

### LMS
- Конструктор курсов: Modules → Lessons → Tasks
- Прогресс обучения, сертификаты, попытки кода (CodeAttempts)
- Студия `/studio`, обучение `/learn`

### Дополнительно
- Wiki (KnowledgeArticle)
- Support threads, AuditLog, API keys
- Marketplace, CSS-тренажёры, AI-страница

## Быстрый старт

```bash
npm install
cp .env.example .env   # настройте DATABASE_URL, NEXTAUTH_SECRET
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Структура маршрутов

| Путь | Назначение |
|------|------------|
| `/learn` | Обучение сотрудников |
| `/studio` | Конструктор курсов |
| `/company/*` | Кабинет компании |
| `/admin` | Платформенная админка |
| `/marketplace` | Маркетплейс курсов |

## Модели Prisma (ключевые)

- `Company`, `OrganizationMember`, `Department`, `Invitation`
- `Course`, `Module`, `Lesson`, `Task`, `Progress`, `Certificate`
- `KnowledgeArticle`, `SupportThread`, `AuditLog`

## Production

```bash
docker compose -f docker-compose.prod.yml up -d
```

Подробнее: `docs/README.md`

## Автор

Владимир Кутомкин — [GitHub](https://github.com/5eeee)
