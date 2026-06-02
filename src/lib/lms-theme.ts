export type LmsTheme = "light" | "dark";

export const LMS_THEME_STORAGE_KEY = "garpium-lms-theme";

export function getStoredTheme(): LmsTheme {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem(LMS_THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function applyLmsTheme(theme: LmsTheme) {
  document.documentElement.dataset.lmsTheme = theme;
  localStorage.setItem(LMS_THEME_STORAGE_KEY, theme);
}

export const LMS_THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("${LMS_THEME_STORAGE_KEY}");if(t==="dark")document.documentElement.dataset.lmsTheme="dark";}catch(e){}})();`;
