/** Каталог курсов — наполняется через CMS / админку (Prisma). Статический HTML/CSS контент удалён. */

export type CourseCatalogItem = {
  slug: string;
  title: string;
  description: string;
  accent: string;
};

export const courses: CourseCatalogItem[] = [];

export function getTrackLessons(_slug: string) {
  return [] as never[];
}

export function getLesson(_id: string) {
  return null;
}

export function getAdjacentLesson(_id: string) {
  return { prev: null, next: null };
}
