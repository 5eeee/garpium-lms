import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(40),
  lastName: z.string().trim().min(2).max(40),
  email: z.string().trim().email().max(80).transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(72)
});

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const organizationCreateSchema = z.object({
  legalForm: z.enum(["SELF_EMPLOYED", "IP", "OOO", "AO", "PAO", "NKO", "GOVERNMENT"]),
  name: z.string().trim().min(2).max(80),
  inn: z.string().trim().min(10).max(12).regex(/^\d+$/, "ИНН — только цифры"),
  ogrn: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  kpp: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  legalName: z.string().trim().min(2).max(200),
  legalAddress: z.string().trim().min(5).max(300),
  corporateEmail: z.string().trim().email().max(80).transform((v) => v.toLowerCase()),
  additionalInfo: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(40)
    .regex(slugPattern, "Код: латиница, цифры и дефис")
    .optional()
});

export const inviteCreateSchema = z.object({
  type: z.enum(["SINGLE_USE", "MULTI_USE"]).default("SINGLE_USE"),
  expiresAt: z.string().datetime().optional(),
  maxUses: z.number().int().min(1).max(10000).optional(),
  departmentId: z.string().cuid().optional(),
  jobTitle: z.string().trim().max(80).optional(),
  assignRole: z
    .enum(["COMPANY_EMPLOYEE", "COMPANY_MANAGER", "COMPANY_ADMIN"])
    .default("COMPANY_EMPLOYEE")
});

export const joinByInviteSchema = z.object({
  code: z.string().trim().min(4).max(40)
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(80).transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(72)
});

export const supportMessageSchema = z.object({
  subject: z.string().trim().min(3).max(120),
  body: z.string().trim().min(2).max(1000)
});

export const departmentCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: z.enum(["DEPARTMENT", "DIVISION", "GROUP", "TEAM", "BRANCH"]).default("DEPARTMENT"),
  parentId: z.string().cuid().optional()
});

export const courseAssignmentSchema = z.object({
  courseSlug: z.string().trim().min(1).max(40),
  scope: z.enum(["COMPANY", "DEPARTMENT", "USER"]),
  departmentId: z.string().cuid().optional(),
  userId: z.string().cuid().optional()
});

export const organizationVerificationSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"])
});

export const domainCreateSchema = z.object({
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .max(120)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, "Некорректный домен")
});

export const knowledgeCategoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(80)
});

export const knowledgeArticleCreateSchema = z.object({
  title: z.string().trim().min(2).max(200),
  content: z.string().trim().min(1).max(50000),
  categoryId: z.string().cuid().optional(),
  visibility: z.enum(["COMPANY", "DEPARTMENT", "MANAGERS", "ADMINS"]).default("COMPANY"),
  departmentId: z.string().cuid().optional(),
  published: z.boolean().default(true)
});

export const knowledgeArticleUpdateSchema = knowledgeArticleCreateSchema.partial();
