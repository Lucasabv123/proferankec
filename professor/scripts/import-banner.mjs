#!/usr/bin/env node
// Pulls courses and instructors from a university's public Banner 9 "Browse Classes"
// search and writes them to a JSON file for review. It never touches the database.
//
//   node scripts/import-banner.mjs --school usfq                      list terms
//   node scripts/import-banner.mjs --school usfq --term 202610 --subject ART
//   node scripts/import-banner.mjs --school udla --term 202710        all subjects (slow, polite)
//
// Requires Node 18+.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHOOLS = {
  usfq: { name: 'Universidad San Francisco de Quito', base: 'https://prodregistration.usfq.edu.ec/StudentRegistrationSsb/ssb' },
  udla: { name: 'Universidad de Las Américas', base: 'https://bannerregistro.udla.edu.ec/StudentRegistrationSsb/ssb' },
};

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
    return acc;
  }, []),
);
const school = SCHOOLS[args.school] && { ...SCHOOLS[args.school], ...(args.base && { base: args.base }) };
if (!school) {
  console.error('Usage: node import-banner.mjs --school usfq|udla [--term CODE] [--subject CODE] [--delay ms]');
  process.exit(1);
}
const DELAY = Number(args.delay ?? 1500);
const PAGE = 500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Minimal cookie jar: Banner ties the chosen term to the JSESSIONID cookie.
const jar = new Map();
let syncToken = '';
async function http(url, opts = {}) {
  const headers = {
    'User-Agent': 'Professorrank data import (student project; one run per semester)',
    Accept: 'application/json, text/html',
    Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; '),
    ...(syncToken && { 'X-Synchronizer-Token': syncToken }),
    ...opts.headers,
  };
  const res = await fetch(url, { ...opts, headers, redirect: 'follow' });
  const cookies = res.headers.getSetCookie?.() ?? [res.headers.get('set-cookie')].filter(Boolean);
  for (const c of cookies) {
    const [pair] = c.split(';');
    const eq = pair.indexOf('=');
    jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res;
}
const getJson = async (url) => (await http(url)).json();
const form = (obj) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
  body: new URLSearchParams(obj).toString(),
});

async function startSession() {
  const html = await (await http(`${school.base}/term/termSelection?mode=search`)).text();
  syncToken = html.match(/name="synchronizerToken"\s+content="([^"]+)"/)?.[1] ?? '';
}

async function listTerms() {
  return getJson(`${school.base}/classSearch/getTerms?searchTerm=&offset=1&max=50`);
}

async function selectTerm(term) {
  await http(`${school.base}/term/search?mode=search`, form({ term, studyPath: '', studyPathText: '', startDatepicker: '', endDatepicker: '' }));
}

async function listSubjects(term) {
  return getJson(`${school.base}/classSearch/get_subject?searchTerm=&term=${term}&offset=1&max=1000`);
}

async function searchSubject(term, subject) {
  await http(`${school.base}/classSearch/resetDataForm`, form({}));
  const sections = [];
  for (let offset = 0; ; offset += PAGE) {
    const q = new URLSearchParams({
      txt_subject: subject, txt_term: term, pageOffset: offset, pageMaxSize: PAGE,
      sortColumn: 'subjectDescription', sortDirection: 'asc',
    });
    const page = await getJson(`${school.base}/searchResults/searchResults?${q}`);
    if (page.success === false) throw new Error(`Search failed for ${subject}`);
    sections.push(...(page.data ?? []));
    if (!page.data?.length || sections.length >= page.totalCount) break;
    await sleep(DELAY);
  }
  return sections;
}

// Banner returns text HTML-escaped ("Ruiz O&ntilde;ate"); turn it back into plain text.
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decode(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    if (ENTITIES[e]) return ENTITIES[e];
    // Accented letters: &aacute; &Ntilde; &uuml; ...
    const accent = { acute: '\u0301', grave: '\u0300', tilde: '\u0303', uml: '\u0308', circ: '\u0302' };
    const k = Object.keys(accent).find((a) => e.length === a.length + 1 && e.endsWith(a));
    return k ? (e[0] + accent[k]).normalize('NFC') : m;
  });
}

// "Idrovo Pérez, Gustavo Andrés" -> { lastName: 'Idrovo Pérez', firstName: 'Gustavo Andrés' }
function splitName(displayName) {
  const [last, first = ''] = displayName.split(',').map((s) => s.trim());
  return { firstName: first, lastName: last };
}

function collect(sections) {
  const courses = new Map();
  const professors = new Map();
  for (const raw of sections) {
    const s = { ...raw, courseTitle: decode(raw.courseTitle), subjectDescription: decode(raw.subjectDescription) };
    const code = `${s.subject} ${s.courseNumber}`;
    if (!courses.has(code)) {
      courses.set(code, {
        code, title: s.courseTitle, subject: s.subject,
        department: s.subjectDescription,
        professors: new Set(), sections: 0,
      });
    }
    const course = courses.get(code);
    course.sections += 1;
    for (const f of s.faculty ?? []) {
      if (!f.displayName) continue;
      f.displayName = decode(f.displayName);
      // Banner's internal id when exposed, otherwise the normalized name. Emails are not stored.
      const key = f.bannerId ? String(f.bannerId) : f.displayName.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
      if (!professors.has(key)) professors.set(key, { key, displayName: f.displayName, ...splitName(f.displayName), courses: new Set() });
      professors.get(key).courses.add(code);
      course.professors.add(key);
    }
  }
  const toArr = (m) => [...m.values()].map((v) => ({
    ...v,
    ...(v.professors && { professors: [...v.professors] }),
    ...(v.courses && { courses: [...v.courses] }),
  }));
  return { courses: toArr(courses), professors: toArr(professors) };
}

async function main() {
  await startSession();
  const terms = (await listTerms()).map((t) => ({ ...t, description: decode(t.description) }));
  if (!args.term) {
    console.log(`Terms at ${args.school.toUpperCase()}:`);
    for (const t of terms) console.log(`  ${t.code}  ${t.description}`);
    console.log('\nRe-run with --term CODE (and optionally --subject CODE).');
    return;
  }
  const term = String(args.term);
  const termName = terms.find((t) => t.code === term)?.description ?? term;
  await selectTerm(term);

  const allSubjects = (await listSubjects(term)).map((s) => ({ ...s, description: decode(s.description) }));
  const subjects = args.subject
    ? allSubjects.filter((s) => s.code === String(args.subject).toUpperCase())
    : allSubjects;
  if (!subjects.length) {
    console.error(`Subject not found. Available: ${allSubjects.map((s) => `${s.code} (${s.description})`).join(', ')}`);
    process.exit(1);
  }

  const sections = [];
  for (const [i, subj] of subjects.entries()) {
    await sleep(DELAY);
    const found = await searchSubject(term, subj.code);
    sections.push(...found);
    console.log(`[${i + 1}/${subjects.length}] ${subj.code} ${subj.description}: ${found.length} sections`);
  }

  const { courses, professors } = collect(sections);
  const out = {
    school: { key: args.school, name: school.name },
    term: { code: term, name: termName },
    fetchedAt: new Date().toISOString(),
    counts: { sections: sections.length, courses: courses.length, professors: professors.length },
    courses, professors,
  };
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out');
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${args.school}-${term}${args.subject ? `-${String(args.subject).toUpperCase()}` : ''}.json`);
  await writeFile(file, JSON.stringify(out, null, 2));
  console.log(`\n${sections.length} sections, ${courses.length} courses, ${professors.length} professors -> ${file}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
