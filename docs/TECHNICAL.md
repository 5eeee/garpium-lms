# Техническая документация — GARPIUM LMS (Corporate Learning OS)

> Репозиторий: [github.com/5eeee/garpium-lms](https://github.com/5eeee/garpium-lms)  
> Автор: Владимир Кутомкин

## 1. Назначение

Multi-tenant SaaS-платформа корпоративного обучения: конструктор курсов, wiki, онбординг, сертификаты, marketplace, RBAC, поддержка ESIA/OAuth.

## 2. Стек

Next.js (App Router) · React · TypeScript · Prisma 6 · PostgreSQL · NextAuth · bcryptjs · Zod · Docker

## 3. Структура

```
src/app/
├── (auth)/             # login, register, company/*
├── (course)/           # learn, studio, company, admin, marketplace
└── api/                # 38+ route handlers
prisma/schema.prisma
docker-compose.prod.yml
release/
```

## 4. UI-маршруты

| Путь | Назначение |
|------|------------|
| `/learn`, `/learn/[slug]` | Обучение сотрудников |
| `/studio` | Конструктор курсов |
| `/company/*` | Кабинет компании |
| `/admin` | Платформенная админка |
| `/marketplace` | Маркетплейс курсов |
| `/certificates/[number]` | Проверка сертификата |
| `/games/*` | CSS-тренажёры |

## 5. API Routes

| Группа | Пути |
|--------|------|
| Auth | `/api/auth/[...nextauth]`, `/auth/esia/*` |
| Profile | `/api/profile/*` |
| Org | `/api/organizations/*`, `/api/company/*` |
| LMS | `/api/v1/courses`, `/api/v1/lessons/[id]` |
| Admin | `/api/admin/*` |
| Support | `/api/support`, `/api/invites/[code]` |

## 6. Prisma-модели

`Company`, `OrganizationMember`, `Department`, `Invitation`, `User`, `Course`, `Module`, `Lesson`, `Task`, `Progress`, `Certificate`, `CodeAttempt`, `KnowledgeArticle`, `SupportThread`, `AuditLog`, `ApiKey`

Enums: `Role`, `ApprovalStatus`, `LessonType`, `ProgressStatus`

## 7. RBAC

- **Platform Admin** — управление платформой
- **Company Admin** — управление компанией
- **Manager, Instructor** — курсы и команда
- **Employee** — обучение

## 8. Запуск

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## 9. Production

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

PowerShell deploy-скрипты в `release/`.

## 10. Переменные окружения

`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, OAuth (`GOOGLE_*`, `YANDEX_*`, `VK_*`)
