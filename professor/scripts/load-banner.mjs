#!/usr/bin/env node
// Loads a JSON file written by scripts/import-banner.mjs into the database.
// Re-running it, or loading a newer term, updates rows instead of duplicating them:
// courses match on (school, code) and professors on (school, externalKey).
//
//   node scripts/load-banner.mjs scripts/out/usfq-202610.json
//   node scripts/load-banner.mjs scripts/out/usfq-202610.json --dry-run

import { readFile } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';

const [file] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const dryRun = process.argv.includes('--dry-run');
if (!file) {
  console.error('Usage: node scripts/load-banner.mjs <import.json> [--dry-run]');
  process.exit(1);
}

const data = JSON.parse(await readFile(file, 'utf8'));
if (!data?.school?.key || !data?.school?.name || !Array.isArray(data.courses) || !Array.isArray(data.professors)) {
  console.error(`${file} is not an import-banner.mjs output file`);
  process.exit(1);
}
const term = data.term?.code ? String(data.term.code) : null;

console.log(`${data.school.name} (${data.school.key}), term ${term ?? 'unknown'}: ${data.courses.length} courses, ${data.professors.length} professors`);
if (dryRun) process.exit(0);

const prisma = new PrismaClient();
try {
  const school = await prisma.school.upsert({
    where: { key: data.school.key },
    update: { name: data.school.name },
    create: { key: data.school.key, name: data.school.name },
  });

  const courseIds = new Map();
  for (const c of data.courses) {
    const fields = { name: c.title || c.code, Department: c.department || c.subject || '' };
    const course = await prisma.course.upsert({
      where: { schoolId_code: { schoolId: school.id, code: c.code } },
      update: { ...fields, userAdded: false }, // a student-added course the school now lists becomes a catalog course
      create: { ...fields, code: c.code, schoolId: school.id },
    });
    courseIds.set(c.code, course.id);
  }

  let links = 0;
  for (const p of data.professors) {
    const fields = {
      Firstname: p.firstName ?? '',
      Lastname: p.lastName || p.displayName,
      displayName: p.displayName,
    };
    const professor = await prisma.professor.upsert({
      where: { schoolId_externalKey: { schoolId: school.id, externalKey: p.key } },
      update: fields,
      create: { ...fields, externalKey: p.key, schoolId: school.id },
    });
    for (const code of p.courses ?? []) {
      const courseId = courseIds.get(code);
      if (!courseId) continue;
      await prisma.courseProfessor.upsert({
        where: { courseId_professorId: { courseId, professorId: professor.id } },
        update: { term },
        create: { courseId, professorId: professor.id, term },
      });
      links += 1;
    }
  }

  console.log(`Loaded ${courseIds.size} courses, ${data.professors.length} professors and ${links} course-professor links into ${school.name}`);
} finally {
  await prisma.$disconnect();
}
