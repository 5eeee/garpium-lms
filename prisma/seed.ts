import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { courses, getTrackLessons } from "../src/lib/course-data";

const prisma = new PrismaClient();

async function main() {
  const garpium = await prisma.company.upsert({
    where: { slug: "garpium" },
    update: {
      name: "GARPIUM",
      website: "https://garpium.com",
      subdomain: "lms",
      logoUrl: "/garpium-logo.png",
      showPoweredBy: true,
      verificationStatus: "VERIFIED",
      isGarpium: true
    },
    create: {
      name: "GARPIUM",
      slug: "garpium",
      website: "https://garpium.com",
      subdomain: "lms",
      logoUrl: "/garpium-logo.png",
      showPoweredBy: true,
      verificationStatus: "VERIFIED",
      isGarpium: true
    }
  });

  const company = await prisma.company.upsert({
    where: { slug: "default" },
    update: {},
    create: { name: "Corporate LMS", slug: "default" }
  });

  await prisma.user.upsert({
    where: { email: "superadmin@garpium.com" },
    update: { role: "SUPER_ADMIN", approvalStatus: "APPROVED" },
    create: {
      firstName: "Super",
      lastName: "Admin",
      email: "superadmin@garpium.com",
      passwordHash: await hash("superadmin12345", 12),
      role: "SUPER_ADMIN",
      approvalStatus: "APPROVED"
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { companyId: garpium.id, role: "COMPANY_OWNER" },
    create: {
      firstName: "Admin",
      lastName: "GARPIUM",
      email: "admin@example.com",
      passwordHash: await hash("admin12345", 12),
      role: "COMPANY_OWNER",
      approvalStatus: "APPROVED",
      companyId: garpium.id
    }
  });

  await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: { approvalStatus: "APPROVED", companyId: garpium.id, role: "COMPANY_EMPLOYEE" },
    create: {
      firstName: "Ученик",
      lastName: "Демо",
      email: "student@example.com",
      passwordHash: await hash("student12345", 12),
      role: "COMPANY_EMPLOYEE",
      approvalStatus: "APPROVED",
      companyId: garpium.id
    }
  });

  await prisma.user.upsert({
    where: { email: "pending@example.com" },
    update: { companyId: garpium.id, role: "COMPANY_EMPLOYEE" },
    create: {
      firstName: "Ожидание",
      lastName: "Демо",
      email: "pending@example.com",
      passwordHash: await hash("pending12345", 12),
      role: "COMPANY_EMPLOYEE",
      approvalStatus: "PENDING",
      companyId: garpium.id
    }
  });

  const seededUsers = await prisma.user.findMany({
    where: { email: { in: ["admin@example.com", "student@example.com", "pending@example.com"] } }
  });

  for (const user of seededUsers) {
    if (!user.companyId) continue;
    const orgRole =
      user.role === "COMPANY_OWNER" || user.role === "COMPANY_ADMIN"
        ? "COMPANY_ADMIN"
        : user.role === "COMPANY_MANAGER"
          ? "COMPANY_MANAGER"
          : "COMPANY_EMPLOYEE";

    await prisma.organizationMember.upsert({
      where: { userId_companyId: { userId: user.id, companyId: user.companyId } },
      update: { orgRole, status: user.approvalStatus === "APPROVED" ? "ACTIVE" : "PENDING" },
      create: {
        userId: user.id,
        companyId: user.companyId,
        orgRole,
        status: user.approvalStatus === "APPROVED" ? "ACTIVE" : "PENDING"
      }
    });
  }

  await prisma.company.update({
    where: { id: garpium.id },
    data: {
      verificationStatus: "VERIFIED",
      isGarpium: true,
      ownerId: (await prisma.user.findUnique({ where: { email: "admin@example.com" } }))?.id
    }
  });

  for (const course of courses) {
    const dbCourse = await prisma.course.upsert({
      where: { slug: course.slug },
      update: { title: course.title, description: course.description, accentColor: course.accent },
      create: {
        slug: course.slug,
        title: course.title,
        description: course.description,
        accentColor: course.accent,
        order: course.slug === "html" ? 1 : 2
      }
    });

    const lessons = getTrackLessons(course.slug);
    const modules = [...new Set(lessons.map((lesson) => lesson.module))];

    for (const [moduleIndex, moduleName] of modules.entries()) {
      const dbModule = await prisma.module.upsert({
        where: { id: `${course.slug}-${moduleIndex + 1}` },
        update: { title: moduleName },
        create: {
          id: `${course.slug}-${moduleIndex + 1}`,
          courseId: dbCourse.id,
          title: moduleName,
          description: `Модуль ${moduleIndex + 1}`,
          order: moduleIndex + 1
        }
      });

      for (const lesson of lessons.filter((item) => item.module === moduleName)) {
        const content = {
          simple: lesson.simple,
          learn: lesson.learn ?? [],
          sections: lesson.sections ?? [],
          project: lesson.project ?? null
        };

        await prisma.lesson.upsert({
          where: { id: lesson.id },
          update: {
            title: lesson.title,
            simple: lesson.simple,
            order: lesson.order,
            content,
            visual: { type: lesson.visual }
          },
          create: {
            id: lesson.id,
            moduleId: dbModule.id,
            type: lesson.track === "html" ? "HTML" : "CSS",
            title: lesson.title,
            simple: lesson.simple,
            content,
            visual: { type: lesson.visual },
            order: lesson.order,
            points: lesson.points,
            tasks: {
              create: {
                type: lesson.task.type === "html" ? "HTML" : "CSS",
                label: lesson.task.label,
                starter: lesson.task.starter,
                preview: lesson.task.preview,
                primary: lesson.task.primary,
                acceptable: lesson.task.acceptable,
                wrongHints: lesson.task.wrongHints
              }
            }
          }
        });
      }
    }
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
