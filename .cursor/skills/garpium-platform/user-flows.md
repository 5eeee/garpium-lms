# GARPIUM — User Flows

Full RBAC chains: [docs/GARPIUM-RBAC-ACCESS-MODEL.md](../../docs/GARPIUM-RBAC-ACCESS-MODEL.md)

## Registration → private user

```mermaid
sequenceDiagram
  participant U as User
  participant API as /api/auth/register
  participant DB as Database
  participant D as /dashboard

  U->>API: POST firstName lastName email password
  API->>DB: User role=PUBLIC_USER approvalStatus=APPROVED
  U->>D: redirect after login
  D->>U: Tab Моя компания: create / join / private
```

## Company creation

```mermaid
sequenceDiagram
  participant U as User
  participant API as /api/organizations/create
  participant DB as Company+User

  U->>API: legalForm name inn ogrn kpp ...
  API->>DB: Company PENDING_VERIFICATION
  API->>DB: User role=COMPANY_OWNER companyId=set
  API->>DB: OrganizationMember PENDING
  Note over U: ESIA optional /api/auth/esia/start?scope=company
  Note over DB: Moderator sets VERIFIED
```

**Files:** `MyCompanySection.tsx`, `organization-legal-forms.ts`, `api/organizations/create/route.ts`

## Invite join (current)

```mermaid
sequenceDiagram
  participant A as Admin
  participant API as /api/company/invites
  participant E as Employee
  participant J as /api/organizations/join

  A->>API: create invite role dept expires
  API-->>A: GARP-XXXX link
  E->>J: POST code
  J->>J: JoinRequest PENDING
  A->>J: approve member
  J->>E: role=COMPANY_EMPLOYEE ACTIVE
```

**Files:** `InviteCreateForm.tsx`, `invite/[code]/page.tsx`, join API

## Learning loop

```mermaid
sequenceDiagram
  participant E as Employee
  participant L as /learn/slug
  participant Les as /lessons/id
  participant A as /api/attempts
  participant C as /api/certificates

  E->>L: course roadmap progress
  E->>Les: lesson content + TaskPractice
  E->>A: POST code checkCode
  A->>A: Progress DONE points++
  E->>C: all lessons DONE
  C->>E: Certificate ISSUED
  Note over E: /certificates/number public verify
```

**Files:** `learning.ts`, `TaskPractice.tsx`, `lessons/[lessonId]/page.tsx`

## Course assignment (company)

```mermaid
sequenceDiagram
  participant Admin
  participant API as /api/company/assignments
  participant E as Employee

  Admin->>API: courseSlug scope COMPANY|DEPARTMENT|USER
  API->>E: course visible in /learn
  E->>E: progress tracked in dashboard StatRing
```

## Profile verification

```mermaid
sequenceDiagram
  participant U as User
  participant E as /api/profile/email/*
  participant P as /api/profile/phone/*
  participant ESIA as /api/auth/esia/start

  U->>E: send-code verify (or password for change)
  U->>P: SMS OTP
  U->>ESIA: scope=user identity verify
```

**Files:** `PersonalDataTab.tsx`, `api-profile.ts`, ESIA routes

## Post-login routing

```mermaid
flowchart TD
  Login[Login success]
  Pending{approvalStatus PENDING?}
  Dash["/dashboard"]
  PendPage["/pending"]

  Login --> Pending
  Pending -->|yes| PendPage
  Pending -->|no| Dash
```

**File:** `getPostLoginPath()` in `src/lib/roles.ts`

## Auth guards map

```mermaid
flowchart LR
  subgraph guards [session.ts]
    RS[requireSession]
    RA[requireApproved]
    RCP[requireCompanyPanel]
    RCA[requireCompanyAdmin]
    RSA[requireSuperAdmin]
    RLA[requireLmsAdmin]
  end
  RS --> RA
  RA --> RCP
  RA --> RCA
  RA --> RSA
  RA --> RLA
```
