// The sample data names each course's school as text; seeds turn those names into School records.
function schoolKey(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// replaces each course's School name with the id of a matching School record
async function withSchoolIds(prisma, courses) {
  const ids = new Map();
  const rows = [];
  for (const { School, ...course } of courses) {
    if (!ids.has(School)) {
      const key = schoolKey(School);
      const school = await prisma.school.upsert({ where: { key }, update: {}, create: { key, name: School } });
      ids.set(School, school.id);
    }
    rows.push({ ...course, schoolId: ids.get(School) });
  }
  return rows;
}

module.exports = { schoolKey, withSchoolIds };
