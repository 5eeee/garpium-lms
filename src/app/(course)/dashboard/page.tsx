import "./dashboard.css";
import { requireSession } from "@/lib/session";
import { getDashboardData } from "@/lib/dashboard-data";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    const session = await requireSession();
    const data = await getDashboardData(session.user.email!);

    if (!data) {
      return (
        <section className="dash-card dash-card--wide lms-frame">
          <h2>Профиль не найден</h2>
        </section>
      );
    }

    const pending = data.user.approvalStatus !== "APPROVED";

    return <DashboardView data={data} pending={pending} />;
  } catch (error) {
    console.error("[dashboard] render error:", error);
    return (
      <section className="dash-card dash-card--wide lms-frame">
        <h2>Не удалось загрузить кабинет</h2>
        <p className="dash-empty">
          Временная ошибка сервера. Обновите страницу или попробуйте позже.
        </p>
      </section>
    );
  }
}
