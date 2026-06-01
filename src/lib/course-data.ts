import legacyLessons from "./legacy-lessons.json";

export type Track = "html" | "css";

export type LessonSection = {
  type: string;
  title?: string;
  body?: string;
  label?: string;
  code?: string;
  bad?: string;
  good?: string;
};

export type Lesson = {
  id: string;
  track: Track;
  order: number;
  module: string;
  title: string;
  simple: string;
  learn?: string[];
  sections?: LessonSection[];
  project?: { step?: number; text?: string } | null;
  visual: "structure" | "box" | "flow" | "editor" | "game";
  task: {
    type: "html" | "css";
    label: string;
    starter: string;
    preview: string;
    primary: string[];
    acceptable: string[];
    wrongHints: { pattern: string; msg: string }[];
  };
  points: number;
};

export const lessons = legacyLessons as Lesson[];

export const courses = [
  {
    slug: "html",
    title: "HTML",
    accent: "#e8622a",
    description: "Семантика, формы, доступность и финальная HTML-структура проекта."
  },
  {
    slug: "css",
    title: "CSS",
    accent: "#0080ff",
    description: "Селекторы, layout, адаптив, визуальная система и полировка проекта."
  }
] as const;

export function getLesson(id: string) {
  return lessons.find((lesson) => lesson.id === id);
}

export function getTrackLessons(track: Track) {
  return lessons.filter((lesson) => lesson.track === track);
}

export function getAdjacentLesson(id: string, dir: "prev" | "next") {
  const lesson = getLesson(id);
  if (!lesson) return null;
  const list = getTrackLessons(lesson.track);
  const index = list.findIndex((item) => item.id === id);
  return list[index + (dir === "next" ? 1 : -1)] || null;
}
