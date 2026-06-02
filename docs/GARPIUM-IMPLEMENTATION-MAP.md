# GARPIUM — Implementation Map (концепция ↔ код)

> Мост между продуктовой моделью и текущей реализацией в репозитории.  
> Обновляйте этот документ при изменении RBAC или добавлении модулей.

---

## 1. Маппинг ролей

| Концепт | `User.role` | `OrganizationMember.orgRole` | Guard / helper | Файл |
|---------|-------------|------------------------------|----------------|------|
| Guest | — | — | middleware redirect `/login` | `src/middleware.ts` |
| Частное лицо | `PUBLIC_USER` | — | `requireApproved()` | `src/lib/session.ts` |
| Employee | `COMPANY_EMPLOYEE` | `COMPANY_EMPLOYEE` | `requireApproved()` | |
| Manager | `COMPANY_MANAGER` | `COMPANY_MANAGER` | `canAccessCompanyPanel()` | `src/lib/roles.ts` |
| Company Admin | `COMPANY_ADMIN` | `COMPANY_ADMIN` | `requireCompanyAdmin()` | |
| Company Owner | `COMPANY_OWNER` | `COMPANY_OWNER` | `requireCompanyAdmin()` | |
| Instructor | `INSTRUCTOR` | — | `isInstructor()` | |
| Garpium Employee | `GARPIUM_EMPLOYEE` | — | `canAccessCompanyPanel()` | |
| Support | `SUPPORT` | — | TBD | |
| Moderator | `MODERATOR` | — | `isLmsAdmin()` | |
| Super Admin | `SUPER_ADMIN` | — | `requireSuperAdmin()` | |

### ⚠️ Известные расхождения

| Проблема | Концепция | Текущий код |
|----------|-----------|-------------|
| Manager = full admin | Manager видит только свой отдел | ~~`COMPANY_MANAGER` ∈ `COMPANY_ADMIN_ROLES`~~ **исправлено** — manager: panel без admin CRUD |
| Invite auto-join | Автовступление после invite | `JoinRequest` + одобрение admin (`/api/organizations/join`) |
| Owner billing | Отдельный UI подписки | Не реализовано |
| Support panel | Очередь тикетов для SUPPORT | Только `/support` для пользователей |
| Separate Instructor | Manager не создаёт курсы | `INSTRUCTOR` + `/studio/*` отдельно |

**Рекомендация:** при рефакторинге вынести Manager из `COMPANY_ADMIN_ROLES`, добавить `requireCompanyManager()` с scope по `departmentId`.

---

## 2. UI-зоны → маршруты → компоненты

### Public Zone

| Маршрут | Статус | Файлы |
|---------|--------|-------|
| `/` | ✅ | `src/app/page.tsx`, `HomeLanding.tsx`, `home.css` |
| `/login`, `/register` | ✅ | `src/app/(auth)/` |
| `/certificates/[number]` | ✅ | `src/app/(course)/certificates/[number]/page.tsx` |
| `/invite/[code]` | ✅ | `src/app/(course)/invite/[code]/page.tsx` |

### LMS Shell (авторизованные)

| Маршрут | Роли | Компоненты |
|---------|------|------------|
| `/dashboard#progress\|courses\|personal\|company\|settings` | все approved | `DashboardTabs.tsx`, `DashboardView.tsx` |
| `/learn`, `/learn/[slug]` | все с доступом | `learn/page.tsx`, `learn/[slug]/page.tsx` |
| `/lessons/[lessonId]` | все с доступом | `lessons/[lessonId]/page.tsx`, `TaskPractice.tsx` |
| `/knowledge`, `/knowledge/[slug]` | company members (ACL) | `knowledge/page.tsx`, ACL in `knowledge-access.ts` |
| `/support` | все | `support/page.tsx` |
| `/security` | все | skeleton |
| `/change-password` | все | `ChangePasswordForm.tsx` |
| `/pending` | approval pending | `pending/page.tsx` |

**Shell:** `CourseShell.tsx` → `LmsSidebar.tsx` + `LmsTopBar.tsx`

### Company Admin Panel

| Маршрут | Guard | Статус |
|---------|-------|--------|
| `/company` | `requireCompanyPanel()` | ✅ overview |
| `/company/employees` | `requireCompanyAdmin()` | ✅ + actions |
| `/company/departments` | `requireCompanyAdmin()` | ✅ tree |
| `/company/courses` | `requireCompanyAdmin()` | ✅ assignments |
| `/company/programs` | `requireCompanyAdmin()` | skeleton |
| `/company/knowledge`, `/company/knowledge/[slug]` | `requireCompanyAdmin()` | ✅ Wiki CRUD |
| `/company/onboarding` | `requireCompanyAdmin()` | skeleton |
| `/company/invitations` | `requireCompanyAdmin()` | ✅ |
| `/company/analytics` | `requireCompanyAdmin()` | ✅ v1 |
| `/company/integrations` | `requireCompanyAdmin()` | skeleton |
| `/company/settings` | `requireCompanyAdmin()` | ✅ domains, white-label preview |
| `/company/settings/audit` | `requireCompanyAdmin()` | ✅ |
| `/company/employees/[userId]/skills` | `requireCompanyAdmin()` | skeleton |

**Nav:** `CompanyNav.tsx`, layout `company/layout.tsx`

### Platform Admin

| Маршрут | Guard | Статус |
|---------|-------|--------|
| `/admin` | `requireLmsAdmin()` | ✅ |
| `/admin/content` | `requireLmsAdmin()` | ✅ |
| `/admin/platform/organizations` | `requireSuperAdmin()` | ✅ verification |
| `/admin/moderation` | `requireSuperAdmin()` | skeleton |
| `/admin/marketplace` | `requireSuperAdmin()` | skeleton |
| `/admin/api` | `requireSuperAdmin()` | ✅ |

**Sidebar platform section:** `LmsSidebar.tsx` (role `SUPER_ADMIN`, `MODERATOR`)

### Author / Studio

| Маршрут | Guard | Статус |
|---------|-------|--------|
| `/studio` | `isInstructor` (client) | skeleton |
| `/studio/courses` | instructor | skeleton |
| `/studio/courses/[courseId]/edit` | instructor | skeleton |
| `/marketplace` | instructor | skeleton |

---

## 3. Sidebar visibility (`LmsSidebar.tsx`)

| Секция | Условие |
|--------|---------|
| Профиль (имя пользователя) | всегда при session |
| Основное (прогресс, обучение, БЗ, помощь) | всегда |
| Компания (11 пунктов) | `isCompanyAdmin(role)` |
| Платформа | `isSuperAdmin(role)` |
| Автор | `isInstructor(role)` |

---

## 4. Личный кабинет — вкладки (`DashboardTabs.tsx`)

| Hash | Label | Содержимое |
|------|-------|------------|
| `#progress` | Главная | StatRing, continue learning, achievements |
| `#courses` | Обучение | Course list, certificates |
| `#personal` | Профиль | `PersonalDataTab` |
| `#company` | Моя компания | `MyCompanySection` |
| `#settings` | Настройки | Platform links, notifications, logout |

---

## 5. API endpoints (ключевые)

| Endpoint | Назначение | Tenant filter |
|----------|------------|---------------|
| `POST /api/organizations/create` | Создание компании | — |
| `POST /api/organizations/join` | Join by invite | companyId |
| `POST /api/company/invites` | Создание приглашения | companyId |
| `PATCH /api/company/members/[id]` | Роль/статус сотрудника | companyId |
| `POST /api/company/domains` | Корп. домен | companyId |
| `POST /api/attempts` | Проверка кода урока | userId |
| `POST /api/certificates` | Выдача сертификата | course completion |
| `POST /api/profile/*` | Профиль, email, phone | userId |
| `GET/POST /api/auth/esia/*` | Госуслуги user/company | scope param |
| `GET/POST /api/company/knowledge/categories` | Категории Wiki | companyId |
| `GET/POST /api/company/knowledge/articles` | Статьи Wiki | companyId |
| `PATCH/DELETE /api/company/knowledge/articles/[id]` | Редактирование статьи | companyId |

**Правило:** новые company API **обязаны** проверять `requireCompanyAdmin()` и фильтровать по `admin.companyId`.

---

## 6. Prisma — ключевые модели

```
User (role, companyId, approvalStatus)
Company (verificationStatus, legalForm, inn, ogrn, kpp, esiaVerifiedAt)
OrganizationMember (userId, companyId, orgRole, departmentId, status)
Invitation (code, type, expiresAt, maxUses, assignRole)
JoinRequest (userId, companyId, status)
Department (companyId, parentId)
Course → Module → Lesson → Task
Progress, Certificate, AuditLog, CourseAssignment
KnowledgeCategory, KnowledgeArticle (KnowledgeVisibility ACL)
```

**Файл схемы:** `prisma/schema.prisma`

---

## 7. Gaps — backlog по приоритету

### P0 — RBAC корректность

- [x] Разделить Manager и Company Admin в guards (`COMPANY_ADMIN_ROLES` без MANAGER)
- [ ] Dedicated Support panel для `SUPPORT` role
- [ ] Owner-only routes: billing, subscription

### P1 — Core CLOS modules

- [x] Wiki CRUD (company; personal — backlog)
- [ ] Onboarding builder + auto-assign
- [ ] Course block builder (Studio)
- [ ] Manager «Моя команда» dashboard

### P2 — Flows

- [ ] Auto-join vs admin approval (config per company)
- [ ] Skill matrix (`/company/employees/[userId]/skills`)
- [ ] 2FA + session management (`/security`)
- [ ] Super Admin impersonation

### P3 — Platform scale

- [ ] Marketplace payments + moderation workflow
- [ ] AI module hooks (`/ai`)
- [ ] Mobile PWA (`/mobile`)
- [ ] Learning paths / programs engine

---

## 8. Design system reference

| Token / class | Файл |
|---------------|------|
| `--ink`, `--accent`, `--border-soft`, `--surface-muted` | `src/app/(course)/lms-base.css` |
| Dashboard, rings, profile rows | `src/app/(course)/dashboard/dashboard.css` |
| Sidebar, shell | `src/app/(course)/lms-shell.css` |
| Learning, company overrides | `src/app/(course)/course-overrides.css` |
| Marketing | `src/app/home.css` |

**Не ломать:** три зоны UI (home / auth / lms shell), Montserrat Alternates для заголовков.

---

## 9. Deploy & schema

| Артефакт | Путь |
|----------|------|
| Fast deploy | `deploy/deploy-fast.ps1` |
| Migrations apply | `deploy/apply-migrations.sh` |
| Self-healing columns | `src/lib/ensure-profile-schema.ts` |
| Legal form migration | `prisma/migrations/20260601210000_company_legal_form/` |
| Knowledge Wiki migration | `prisma/migrations/20260601220000_knowledge_wiki/` |

---

## 10. Быстрая навигация для разработчика

```
Новая employee-facing страница
  → src/app/(course)/<route>/page.tsx
  → requireApproved() in page or layout
  → add title in src/lib/lms-page-titles.ts
  → add nav link in LmsSidebar if needed

Новая company admin страница
  → src/app/(course)/company/<route>/page.tsx
  → requireCompanyAdmin()
  → CompanyNav.tsx + company/layout.tsx

Новый platform admin
  → src/app/(course)/admin/<route>/page.tsx
  → requireSuperAdmin() or requireLmsAdmin()
  → LmsSidebar platform section
```

---

## Связанные документы

- [GARPIUM-PRODUCT-VISION.md](./GARPIUM-PRODUCT-VISION.md)
- [GARPIUM-RBAC-ACCESS-MODEL.md](./GARPIUM-RBAC-ACCESS-MODEL.md)
- `.cursor/skills/garpium-platform/SKILL.md`
