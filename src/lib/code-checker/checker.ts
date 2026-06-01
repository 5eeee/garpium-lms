export type DiagnosticLevel = "success" | "info" | "warn" | "error";

export type Diagnostic = {
  level: DiagnosticLevel;
  title: string;
  text: string;
  line?: number;
};

export type CheckConfig = {
  type: "html" | "css";
  primary: string[];
  acceptable: string[];
  wrongHints: { pattern: string; msg: string }[];
};

export type CheckResult = {
  ok: boolean;
  tier: "PRIMARY" | "ACCEPTABLE" | "FAIL" | "WRONG" | "SYNTAX";
  message: string;
  diagnostics: Diagnostic[];
};

const cssProps = new Set([
  "align-items", "background", "background-color", "border", "border-radius", "box-sizing",
  "color", "cursor", "display", "flex", "flex-direction", "font-family", "font-size",
  "font-weight", "gap", "grid-column", "grid-row", "grid-template-columns", "height",
  "justify-content", "line-height", "margin", "max-width", "min-height", "opacity",
  "padding", "position", "text-align", "transform", "transition", "width", "z-index"
]);

const voidTags = new Set(["br", "hr", "img", "input", "link", "meta", "source", "wbr"]);

export function checkCode(code: string, config: CheckConfig): CheckResult {
  const safeCode = code.slice(0, 1000);
  const diagnostics = [
    ...analyzeCommon(safeCode),
    ...(config.type === "css" ? analyzeCss(safeCode) : analyzeHtml(safeCode))
  ];
  const hasSyntaxError = diagnostics.some((item) => item.level === "error");

  if (hasSyntaxError) {
    return { ok: false, tier: "SYNTAX", message: "Сначала исправьте синтаксис.", diagnostics };
  }

  for (const wrong of config.wrongHints) {
    if (new RegExp(wrong.pattern, "i").test(safeCode)) {
      return { ok: false, tier: "WRONG", message: wrong.msg, diagnostics };
    }
  }

  const normalized = normalize(safeCode);
  if (config.primary.some((pattern) => normalized.includes(normalize(pattern)))) {
    return {
      ok: true,
      tier: "PRIMARY",
      message: "Лучший вариант. Код понятный и подходит для проекта.",
      diagnostics: [{ level: "success", title: "Принято", text: "Основная проверка пройдена." }, ...diagnostics]
    };
  }

  if (config.acceptable.some((pattern) => normalized.includes(normalize(pattern)))) {
    return {
      ok: true,
      tier: "ACCEPTABLE",
      message: "Работает, но есть более желательный вариант.",
      diagnostics: [{ level: "warn", title: "Допустимо", text: "Решение засчитано, но стоит переписать чище." }, ...diagnostics]
    };
  }

  return {
    ok: false,
    tier: "FAIL",
    message: "Код валидный, но не решает задание.",
    diagnostics
  };
}

export function formatCode(code: string, type: "html" | "css") {
  if (type === "css") {
    return code
      .replace(/\s*\{\s*/g, " {\n  ")
      .replace(/;\s*/g, ";\n  ")
      .replace(/\s*\}\s*/g, "\n}\n")
      .trim();
  }

  return code
    .replace(/>\s+</g, ">\n<")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

function analyzeCommon(code: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (!code.trim()) {
    diagnostics.push({ level: "info", title: "Пустой редактор", text: "Напишите код по заданию." });
  }
  if (/(.)\1{80,}/.test(code)) {
    diagnostics.push({ level: "error", title: "Спам", text: "Слишком много одинаковых символов подряд." });
  }
  if (/<script[\s>]/i.test(code) || /on\w+\s*=/i.test(code)) {
    diagnostics.push({ level: "error", title: "Опасный код", text: "script и inline-события запрещены в практике." });
  }
  return diagnostics;
}

function analyzeHtml(code: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const stack: string[] = [];
  const tags = code.matchAll(/<\/?([a-z][a-z0-9-]*)(\s[^>]*)?>/gi);

  for (const match of tags) {
    const full = match[0];
    const tag = match[1].toLowerCase();
    if (full.startsWith("</")) {
      const last = stack.pop();
      if (last && last !== tag) {
        diagnostics.push({ level: "error", title: "Закрытие тега", text: `Открыт <${last}>, а закрывается </${tag}>.` });
      }
    } else if (!voidTags.has(tag) && !full.endsWith("/>")) {
      stack.push(tag);
    }
  }

  if (stack.length) {
    diagnostics.push({ level: "error", title: "Тег не закрыт", text: `Добавьте </${stack[stack.length - 1]}>.` });
  }
  if (/<img\b/i.test(code) && !/<img\b[^>]*\salt=/i.test(code)) {
    diagnostics.push({ level: "warn", title: "alt", text: "У img должен быть alt." });
  }
  return diagnostics;
}

function analyzeCss(code: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if ((code.match(/\{/g) || []).length !== (code.match(/\}/g) || []).length) {
    diagnostics.push({ level: "error", title: "Скобки", text: "Количество { и } не совпадает." });
  }

  for (const match of code.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const body = match[2];
    for (const rawDecl of body.split(";")) {
      const decl = rawDecl.trim();
      if (!decl) continue;
      if (!decl.includes(":")) {
        diagnostics.push({ level: "error", title: "Двоеточие", text: `В "${decl}" нет двоеточия.` });
        continue;
      }
      const prop = decl.split(":")[0].trim();
      if (!prop.startsWith("--") && !cssProps.has(prop)) {
        diagnostics.push({ level: "warn", title: "Свойство", text: `"${prop}" похоже на опечатку.` });
      }
    }
  }
  return diagnostics;
}

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}
