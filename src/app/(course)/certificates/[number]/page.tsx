import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CertificateVerifyPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const certificate = await db.certificate.findUnique({
    where: { number },
    include: { user: { include: { company: true } } }
  });

  if (!certificate || certificate.status !== "ISSUED") notFound();

  const issuedAt = certificate.issuedAt
    ? new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(certificate.issuedAt)
    : "—";

  return (
    <section className="certificate-verify lms-frame">
      <div>
        <span className="course-kicker">Проверка сертификата</span>
        <h1 className="course-title">Сертификат действителен</h1>
        <p className="course-lead">
          {certificate.user.firstName} {certificate.user.lastName} · {certificate.user.company?.name || "Garpium Academy"}
        </p>
      </div>
      <div className="certificate-verify__body">
        <div>
          <span className="card-label">Номер</span>
          <strong>{certificate.number}</strong>
        </div>
        <div>
          <span className="card-label">Дата выдачи</span>
          <strong>{issuedAt}</strong>
        </div>
        <div className="certificate-verify__qr" aria-label="QR-код проверки">
          QR
        </div>
      </div>
    </section>
  );
}
