---
name: garpium-platform
description: >-
  GARPIUM CLOS product model, RBAC, user flows, and UI zones.
  Use when implementing features, roles, permissions, navigation,
  company/employee flows, onboarding, wiki, analytics, or when
  the user mentions Garpium concept, roles, access, or tenant logic.
---

# GARPIUM Platform Skill

## Product (one paragraph)

GARPIUM is a **Corporate Learning Operating System** — multi-tenant SaaS where each company is an isolated tenant. One login for everyone; after auth the UI adapts to `User.role`. Core modules: personal dashboard, learning (LMS), company admin, wiki, onboarding, analytics, certificates, integrations. Not "just another LMS" — positioning is knowledge + adaptation + training in one place.

## UI Shells (four zones)

| Zone | Routes | Who |
|------|--------|-----|
| Marketing | `/`, `/login`, `/register` | Guest |
| Employee LK | `/dashboard`, `/learn`, `/knowledge` | All approved users |
| Company Admin | `/company/*` | `COMPANY_OWNER`, `COMPANY_ADMIN`, `COMPANY_MANAGER`* |
| Platform Admin | `/admin/*` | `SUPER_ADMIN`, `MODERATOR` |
| Author | `/studio/*`, `/marketplace` | `INSTRUCTOR` |

\*Manager currently shares admin panel — see gaps in IMPLEMENTATION-MAP.

## Role hierarchy

```
Tenant:  EMPLOYEE → MANAGER → ADMIN → OWNER
Platform: GUEST | PUBLIC_USER | SUPPORT | MODERATOR | SUPER_ADMIN | INSTRUCTOR | GARPIUM_EMPLOYEE
```

## Decision tree (agent)

### New page

1. **Which zone?** public / LK / company / admin / studio
2. **Which roles?** Check matrix in [roles-reference.md](roles-reference.md)
3. **Which guard?**
   - Public: none
   - LK: `requireApproved()` in `src/lib/session.ts`
   - Company: `requireCompanyAdmin()` or `requireCompanyPanel()`
   - Platform: `requireSuperAdmin()` / `requireLmsAdmin()`
4. **Add title:** `src/lib/lms-page-titles.ts`
5. **Add nav:** `LmsSidebar.tsx` and/or `CompanyNav.tsx`

### New API route

1. `requireSession()` minimum; role-specific guard for mutations
2. **Always filter by `companyId`** for tenant data — never trust client-supplied companyId alone
3. Write audit: `writeAuditLog()` from `src/lib/audit`
4. Validate with zod in `src/lib/validators.ts`

### New UI component

- Reuse tokens from `src/app/(course)/lms-base.css`
- Cards: `.lms-card`, `.dash-card`, `.surface-muted`
- Buttons: `.course-button`, accent: `.is-accent`
- Avoid heavy borders / `lms-frame` unless intentional
- Match existing patterns in `dashboard.css`, `lms-shell.css`

## Personal dashboard tabs

| Hash | RU label | Content owner |
|------|----------|---------------|
| `progress` | Главная | `DashboardView` progressPanel |
| `courses` | Обучение | coursesPanel |
| `personal` | Профиль | `PersonalDataTab` |
| `company` | Моя компания | `MyCompanySection` |
| `settings` | Настройки | settingsPanel |

## Company lifecycle (short)

1. User registers → `PUBLIC_USER`
2. Creates company → `COMPANY_OWNER`, company `PENDING_VERIFICATION`
3. Moderator verifies → `VERIFIED`, full `/company` access
4. Admin creates invite → employee joins via code → `JoinRequest` → admin approves → `COMPANY_EMPLOYEE`

## Do / Don't

**DO:**

- Single login for all roles
- Tenant isolation (`companyId` on queries)
- Soft UI: `--border-soft`, `--surface-muted`
- ESIA for user (`scope=user`) and company (`scope=company`)
- Placeholder pages with consistent skeleton until feature is built

**DON'T:**

- Separate login pages per role
- Permanent company-wide join codes
- Cross-tenant data leaks
- Break design system without user request
- Implement billing/AI as "done" — mark as future

## Key files

| Purpose | Path |
|---------|------|
| Roles helpers | `src/lib/roles.ts` |
| Session guards | `src/lib/session.ts` |
| Sidebar | `src/components/LmsSidebar.tsx` |
| LK tabs | `src/components/dashboard/DashboardTabs.tsx` |
| Company section | `src/components/MyCompanySection.tsx` |
| Schema | `prisma/schema.prisma` |

## Additional resources

- [roles-reference.md](roles-reference.md) — compact matrix + see/can't see
- [user-flows.md](user-flows.md) — mermaid flows
- [docs/GARPIUM-IMPLEMENTATION-MAP.md](../../docs/GARPIUM-IMPLEMENTATION-MAP.md) — concept ↔ code gaps
- [docs/GARPIUM-RBAC-ACCESS-MODEL.md](../../docs/GARPIUM-RBAC-ACCESS-MODEL.md) — full RBAC spec
- [docs/GARPIUM-PRODUCT-VISION.md](../../docs/GARPIUM-PRODUCT-VISION.md) — product vision
