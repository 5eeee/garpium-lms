import type { Role } from "@prisma/client";

export const COMPANY_ADMIN_ROLES: Role[] = [
  "COMPANY_OWNER",
  "COMPANY_ADMIN",
  "COMPANY_MANAGER"
];

export const COMPANY_PANEL_ROLES: Role[] = [
  ...COMPANY_ADMIN_ROLES,
  "GARPIUM_EMPLOYEE"
];

export function isSuperAdmin(role?: Role | string | null) {
  return role === "SUPER_ADMIN";
}

export function isLmsAdmin(role?: Role | string | null) {
  return isSuperAdmin(role) || isCompanyAdmin(role);
}

export function isCompanyAdmin(role?: Role | string | null) {
  return role != null && COMPANY_ADMIN_ROLES.includes(role as Role);
}

export function canAccessCompanyPanel(role?: Role | string | null) {
  return role != null && COMPANY_PANEL_ROLES.includes(role as Role);
}

export function getPostLoginPath(input: {
  role?: Role | string | null;
  approvalStatus?: string | null;
}) {
  if (input.role === "SUPER_ADMIN") return "/admin";
  if (
    input.role === "COMPANY_OWNER" ||
    input.role === "COMPANY_ADMIN" ||
    input.role === "COMPANY_MANAGER"
  ) {
    return "/company";
  }
  if (input.approvalStatus !== "APPROVED") return "/pending";
  return "/dashboard";
}

export function roleLabel(role?: Role | string | null) {
  const labels: Record<string, string> = {
    SUPER_ADMIN: "Суперадмин",
    GARPIUM_EMPLOYEE: "Сотрудник Garpium",
    COMPANY_OWNER: "Владелец компании",
    COMPANY_ADMIN: "Администратор",
    COMPANY_MANAGER: "Менеджер",
    COMPANY_EMPLOYEE: "Сотрудник",
    PUBLIC_USER: "Пользователь",
    SUPPORT: "Поддержка"
  };
  return role ? labels[role] || role : "—";
}

export function verificationLabel(status?: string | null) {
  const labels: Record<string, string> = {
    PENDING_VERIFICATION: "Ожидает проверки",
    VERIFIED: "Подтверждена",
    REJECTED: "Отклонена"
  };
  return status ? labels[status] || status : "—";
}
