import { GlossaryView } from "@/components/GlossaryView";

export default function GlossaryPage() {
  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Reference</span>
        <h1 className="course-title">Глоссарий</h1>
        <p className="course-lead">Все ключевые термины HTML и CSS курса. Коротко, по делу, на русском.</p>
      </header>
      <GlossaryView />
    </>
  );
}
