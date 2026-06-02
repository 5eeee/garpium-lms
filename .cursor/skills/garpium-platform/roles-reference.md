# GARPIUM — Roles Reference (compact)

Full spec: [docs/GARPIUM-RBAC-ACCESS-MODEL.md](../../docs/GARPIUM-RBAC-ACCESS-MODEL.md)

## Enum mapping

| Concept | `User.role` | Guard |
|---------|-------------|-------|
| Guest | — | none |
| Private | `PUBLIC_USER` | `requireApproved` |
| Employee | `COMPANY_EMPLOYEE` | `requireApproved` |
| Manager | `COMPANY_MANAGER` | `canAccessCompanyPanel` | read-only company ops |
| Admin | `COMPANY_ADMIN` | `requireCompanyAdmin` |
| Owner | `COMPANY_OWNER` | `requireCompanyAdmin` |
| Instructor | `INSTRUCTOR` | `isInstructor` |
| Support | `SUPPORT` | TBD |
| Moderator | `MODERATOR` | `isLmsAdmin` |
| Super Admin | `SUPER_ADMIN` | `requireSuperAdmin` |
| Garpium internal | `GARPIUM_EMPLOYEE` | `canAccessCompanyPanel` |

## See / Can / Can't (summary)

### Guest
- **See:** `/`, auth pages, cert verify
- **Can:** register, login
- **Can't:** dashboard, company, admin

### PUBLIC_USER
- **See:** full LK, `/learn`, `#company` empty/create
- **Can:** courses (public access), profile, create/join company
- **Can't:** `/company/*`

### COMPANY_EMPLOYEE
- **See:** LK all tabs, learn, knowledge, support sidebar
- **Can:** take courses, certs, profile, support tickets, wiki (ACL)
- **Can't:** `/company/*`, other employees' data, analytics

### COMPANY_MANAGER (target vs current)
- **Target see:** own department team, dept analytics, assign to dept
- **Target can't:** company structure CRUD, billing, global settings
- **Current:** panel access without admin CRUD (settings, invites, member edit — admin only)

### COMPANY_ADMIN
- **See:** `/company/*`, company sidebar section
- **Can:** employees, depts, invites, courses assign, analytics, settings, API
- **Can't:** billing (Owner), delete company

### COMPANY_OWNER
- **See:** all Admin + billing (target)
- **Can:** subscription, transfer ownership, verify docs

### INSTRUCTOR
- **See:** `/studio/*`, `/marketplace`, author sidebar
- **Can:** create/edit own courses, publish (with moderation)

### MODERATOR
- **See:** `/admin/moderation`, `/admin/platform/organizations`
- **Can:** verify/reject companies, moderate marketplace

### SUPER_ADMIN
- **See:** all `/admin/*`
- **Can:** all tenants, platform config, impersonate (target)

## Permission matrix (quick)

| Action | Emp | Mgr | Admin | Owner | Mod | Super |
|--------|:---:|:---:|:-----:|:-----:|:---:|:-----:|
| Own LK | ✅ | ✅ | ✅ | ✅ | | ✅* |
| Take course | ✅ | ✅ | ✅ | ✅ | | |
| Assign course (dept) | | ✅ | ✅ | ✅ | | |
| Assign course (all) | | | ✅ | ✅ | | |
| Company CRUD | | | ✅ | ✅ | | ✅* |
| Verify company | | | docs | docs | ✅ | ✅ |
| Platform admin | | | | | ✅ | ✅ |

\*Via impersonation or admin tools.

## Sidebar sections (`LmsSidebar.tsx`)

| Section | Condition |
|---------|-----------|
| Profile header | `session.user` |
| Основное | always |
| Компания | `isCompanyAdmin(role)` |
| Платформа | `isSuperAdmin(role)` |
| Автор | `isInstructor(role)` |

## LK tabs (`DashboardTabs.tsx`)

`progress` | `courses` | `personal` | `company` | `settings`
