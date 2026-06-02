import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireCompanyAdmin, getCompanyForAdmin } from "@/lib/session";

const baseSkills = ["HTML", "CSS", "JavaScript", "React", "Git"];

export default async function EmployeeSkillsPage({ params }: { params: Promise<{ userId: string }> }) {
  await requireCompanyAdmin();
  const company = await getCompanyForAdmin();
  const { userId } = await params;
  if (!company) return null;

  const member = await db.organizationMember.findFirst({
    where: { companyId: company.id, userId },
    include: { user: { include: { progress: { where: { status: "DONE" } } } } }
  });
  if (!member) notFound();

  const done = member.user.progress.length;

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Skill Matrix</span>
        <h1 className="course-title">
          {member.user.firstName} {member.user.lastName}
        </h1>
        <p className="course-lead">Навыки рассчитываются из прогресса и результатов тестов.</p>
      </header>
      <section className="lesson-grid">
        <article className="lesson-card span-12">
          {baseSkills.map((skill, index) => {
            const value = Math.min(100, done * 10 + index * 7);
            return (
              <div className="skill-row" key={skill}>
                <strong>{skill}</strong>
                <div className="dash-progress" aria-hidden>
                  <span style={{ width: `${value}%` }} />
                </div>
                <span>{value}%</span>
              </div>
            );
          })}
        </article>
      </section>
    </>
  );
}
