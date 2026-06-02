import type { Role } from "@prisma/client";

export const COMPANY_ADMIN_ROLES: Role[] = ["COMPANY_OWNER", "COMPANY_ADMIN"];

export const COMPANY_MANAGER_ROLES: Role[] = ["COMPANY_MANAGER"];

export const COMPANY_LEADER_ROLES: Role[] = [...COMPANY_ADMIN_ROLES, ...COMPANY_MANAGER_ROLES];

export const COMPANY_PANEL_ROLES: Role[] = [...COMPANY_LEADER_ROLES, "GARPIUM_EMPLOYEE"];

export function isSuperAdmin(role?: Role | string | null) {
  return role === "SUPER_ADMIN";
}

export function isLmsAdmin(role?: Role | string | null) {
  return isSuperAdmin(role) || isCompanyAdmin(role) || role === "MODERATOR";
}

export function isInstructor(role?: Role | string | null) {
  return role === "INSTRUCTOR" || isLmsAdmin(role);
}

export function isCompanyManager(role?: Role | string | null) {
  return role != null && COMPANY_MANAGER_ROLES.includes(role as Role);
}

export function isCompanyLeader(role?: Role | string | null) {
  return role != null && COMPANY_LEADER_ROLES.includes(role as Role);
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
    INSTRUCTOR: "Автор курсов",
    MODERATOR: "Модератор",
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
