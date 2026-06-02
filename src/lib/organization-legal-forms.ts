import type { OrganizationLegalForm } from "@prisma/client";

export type LegalFormKey = OrganizationLegalForm;

export const ORGANIZATION_LEGAL_FORMS: Record<
  LegalFormKey,
  {
    label: string;
    description: string;
    innHint: string;
    innLength: number[];
    needsOgrn: boolean;
    ogrnLabel?: string;
    needsKpp: boolean;
    esiaHint: string;
  }
> = {
  SELF_EMPLOYED: {
    label: "Самозанятый",
    description: "Физлицо с налогом на профессиональный доход",
    innHint: "12 цифр (ИНН физлица)",
    innLength: [12],
    needsOgrn: false,
    needsKpp: false,
    esiaHint: "Подтверждение через Госуслуги по ИНН самозанятого"
  },
  IP: {
    label: "ИП",
    description: "Индивидуальный предприниматель",
    innHint: "12 цифр",
    innLength: [12],
    needsOgrn: true,
    ogrnLabel: "ОГРНИП",
    needsKpp: false,
    esiaHint: "Верификация ИП через Госуслуги (ЕСИА)"
  },
  OOO: {
    label: "ООО",
    description: "Общество с ограниченной ответственностью",
    innHint: "10 цифр",
    innLength: [10],
    needsOgrn: true,
    ogrnLabel: "ОГРН",
    needsKpp: true,
    esiaHint: "Официальная проверка юрлица через Госуслуги"
  },
  AO: {
    label: "АО",
    description: "Акционерное общество",
    innHint: "10 цифр",
    innLength: [10],
    needsOgrn: true,
    ogrnLabel: "ОГРН",
    needsKpp: true,
    esiaHint: "Верификация АО через Госуслуги"
  },
  PAO: {
    label: "ПАО",
    description: "Публичное акционерное общество",
    innHint: "10 цифр",
    innLength: [10],
    needsOgrn: true,
    ogrnLabel: "ОГРН",
    needsKpp: true,
    esiaHint: "Верификация ПАО через Госуслуги"
  },
  NKO: {
    label: "НКО",
    description: "Некоммерческая организация",
    innHint: "10 цифр",
    innLength: [10],
    needsOgrn: true,
    ogrnLabel: "ОГРН",
    needsKpp: false,
    esiaHint: "Проверка НКО через Госуслуги"
  },
  GOVERNMENT: {
    label: "Госорганизация",
    description: "Государственная или муниципальная организация",
    innHint: "10 цифр",
    innLength: [10],
    needsOgrn: true,
    ogrnLabel: "ОГРН",
    needsKpp: true,
    esiaHint: "Подтверждение через Госуслуги (ЕСИА для организаций)"
  }
};

export const LEGAL_FORM_KEYS = Object.keys(ORGANIZATION_LEGAL_FORMS) as LegalFormKey[];
