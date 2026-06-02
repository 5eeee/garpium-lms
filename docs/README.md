# GARPIUM LMS — Документация проекта

Оглавление документации репозитория `corporate-lms-platform`.

---

## Продукт и архитектура

| Документ | Описание |
|----------|----------|
| [GARPIUM-PRODUCT-VISION.md](./GARPIUM-PRODUCT-VISION.md) | Полная концепция платформы: CLOS, модули, аудитория, UI-принципы, AI roadmap |
| [GARPIUM-RBAC-ACCESS-MODEL.md](./GARPIUM-RBAC-ACCESS-MODEL.md) | Роли, иерархия, жизненные циклы, матрица прав, UI по ролям |
| [GARPIUM-IMPLEMENTATION-MAP.md](./GARPIUM-IMPLEMENTATION-MAP.md) | Связь концепции с кодом: маршруты, guards, gaps, backlog |
| [ITERATIONS.md](./ITERATIONS.md) | План итераций разработки |
| [GARPIUM-FULL-DOCUMENTATION.docx](./GARPIUM-FULL-DOCUMENTATION.docx) | Полная документация в Word (генерация: `python scripts/generate-garpium-docx.py`) |

---

## Для Cursor Agent

| Артефакт | Путь |
|----------|------|
| Skill (операционный) | `.cursor/skills/garpium-platform/SKILL.md` |
| Сжатая матрица ролей | `.cursor/skills/garpium-platform/roles-reference.md` |
| User flows (mermaid) | `.cursor/skills/garpium-platform/user-flows.md` |
| Always-on rule | `.cursor/rules/garpium-product.mdc` |

При задачах по ролям, навигации и новым модулям агент должен читать skill и IMPLEMENTATION-MAP.

---

## Операционная документация

| Документ | Описание |
|----------|----------|
| [LOGINS.md](./LOGINS.md) | Тестовые учётные записи |
| [PODKLYUCHENIE.md](./PODKLYUCHENIE.md) | Подключение и локальный запуск |
| [PRODUCTION-REG.RU.md](./PRODUCTION-REG.RU.md) | Продакшен на REG.RU / VPS |
| [OAUTH-SSO.md](./OAUTH-SSO.md) | OAuth и корпоративный SSO |

---

## Deploy

| Скрипт | Назначение |
|--------|------------|
| `deploy/deploy-fast.ps1` | Быстрый деплой на VPS |
| `deploy/apply-migrations.sh` | SQL-миграции на сервере |

---

## Быстрый старт для разработчика

1. Прочитать [GARPIUM-PRODUCT-VISION.md](./GARPIUM-PRODUCT-VISION.md) — что строим
2. Прочитать [GARPIUM-RBAC-ACCESS-MODEL.md](./GARPIUM-RBAC-ACCESS-MODEL.md) — кто что видит
3. Открыть [GARPIUM-IMPLEMENTATION-MAP.md](./GARPIUM-IMPLEMENTATION-MAP.md) — что уже есть в коде
4. Локальный запуск: [PODKLYUCHENIE.md](./PODKLYUCHENIE.md)
