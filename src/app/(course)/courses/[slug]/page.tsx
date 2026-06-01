import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Roadmap } from "@/components/Roadmap";
import { MapTabs } from "@/components/MapTabs";
import { courses, getTrackLessons, type Track } from "@/lib/course-data";
import { db } from "@/lib/db";
import { requireApproved } from "@/lib/session";
import { userCanAccessCourse } from "@/lib/course-access";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await requireApproved();
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);
  if (!course) notFound();

  const user = await db.user.findUnique({
    where: { id: session.user.id! },
    include: {
      company: true,
      memberships: { where: { status: "ACTIVE" } }
    }
  });

  if (user && !(await userCanAccessCourse(user, slug))) {
    redirect("/dashboard");
  }

  const track = slug as Track;
  const lessons = getTrackLessons(track);
  const progress = await db.progress.findMany({
    where: { userId: session.user.id!, status: "DONE" },
    select: { lessonId: true }
  });
  const doneIds = progress.map((item) => item.lessonId);
  const firstLesson = lessons[0];

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">120 lessons</span>
        <h1 className="course-title">Карта курса</h1>
        <p className="course-lead">
          60 HTML + 60 CSS. Короткие уроки, практика на каждом, общий проект - лендинг-портфолио.
        </p>
        <MapTabs track={track} />
      </header>

      <Roadmap doneIds={doneIds} lessons={lessons} track={track} />

      <footer className="course-footer">
        <Link className="course-button" href="/">← Главная</Link>
        {firstLesson ? (
          <Link className="course-button is-primary" href={`/lessons/${firstLesson.id}`}>
            Начать →
          </Link>
        ) : null}
      </footer>
    </>
  );
}
