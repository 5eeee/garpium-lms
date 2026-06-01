"use client";

import { useState } from "react";

export function CopyCompanyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="company-code">
      <code className="company-code__value">{code}</code>
      <button className="course-button" onClick={copy} type="button">
        {copied ? "Скопировано" : "Скопировать код"}
      </button>
    </div>
  );
}
