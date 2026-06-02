# GARPIUM — Итерации разработки

> Сверка с [GARPIUM-IMPLEMENTATION-MAP.md](./GARPIUM-IMPLEMENTATION-MAP.md) и [GARPIUM-RBAC-ACCESS-MODEL.md](./GARPIUM-RBAC-ACCESS-MODEL.md).  
> Правило: **нет нерабочих кнопок** в навигации и на страницах.

---

## Итерация 0 — Документация ✅

- [x] GARPIUM-PRODUCT-VISION.md
- [x] GARPIUM-RBAC-ACCESS-MODEL.md
- [x] GARPIUM-IMPLEMENTATION-MAP.md
- [x] Skill `.cursor/skills/garpium-platform/`
- [x] Rule `.cursor/rules/garpium-product.mdc`
- [x] Word: `docs/GARPIUM-FULL-DOCUMENTATION.docx` (скрипт `scripts/generate-garpium-docx.py`)

---

## Итерация 1 — Навигация и рабочие UI ✅

**Цель:** меньше кликов, только рабочие пункты меню.

- [x] Централизованный `src/lib/nav-config.ts` — флаг `live` для пунктов
- [x] Sidebar / CompanyNav — только `live: true`
- [x] «Моя компания» в sidebar → `/dashboard#company` (1 клик)
- [x] Убрать «База знаний» из sidebar до Wiki v1
- [x] Убрать мёртвые кнопки: integrations, security, studio blocks
- [x] Исправить footer `/company`: «Курсы» → `/company/courses`
- [x] Knowledge page — информативная, без ложных CTA
- [x] Moderation — ссылка на рабочую верификацию организаций
- [x] TopBar: «Безопасность» → профиль; уведомления → settings

**Сверка с docs:** раздел 2 IMPLEMENTATION-MAP — skeleton routes скрыты из nav.

---

## Итерация 2 — RBAC Manager vs Admin ✅

**Цель:** соответствие GARPIUM-RBAC §3.4 Manager.

- [x] `COMPANY_ADMIN_ROLES` = OWNER + ADMIN (без MANAGER)
- [x] `requireCompanyPanel()` — Manager + Admin + Garpium Employee
- [x] Manager: overview, employees (read), analytics, courses (read)
- [x] Admin-only: settings, invitations, departments, join approve, member CRUD

---

## Итерация 3 — Wiki v1 ✅

- [x] Prisma: KnowledgeCategory, KnowledgeArticle + ACL (KnowledgeVisibility)
- [x] Company admin CRUD (`/company/knowledge`, API)
- [x] Employee read with ACL (`/knowledge`, `/knowledge/[slug]`)
- [x] Вернуть пункт «База знаний» в nav

---

## Итерация 4 — Onboarding v1

- [ ] Шаблоны программ адаптации
- [ ] Auto-assign при join
- [ ] Employee checklist UI

---

## Итерация 5 — Studio / Programs

- [ ] Block builder MVP
- [ ] Learning paths engine
- [ ] Маркетплейс workflow

---

## Итерация 6 — Platform scale

- [ ] Support panel (SUPPORT role)
- [ ] Owner billing
- [ ] 2FA / sessions
- [ ] Super Admin impersonation

---

## Чеклист перед каждым деплоем

1. Все пункты sidebar `live: true` открываются без ошибок
2. Нет `<button>` без handler / API
3. Guards соответствуют RBAC doc
4. Обновить IMPLEMENTATION-MAP gaps
