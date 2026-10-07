import Link from "next/link";
import { notFound } from "next/navigation";
import HomeButton from "@/components/util/homeButton";
import TopSearchSection from "@/components/searchbar/topSection";
import getSchool from "@/helpers/school/getschool";
import { getDictionary } from "@/helpers/i18n/locale";
import { format } from "@/helpers/i18n/dictionaries";
import { coursePath, professorPath, schoolPath } from "@/helpers/links";
import { getTopCourses, getTopProfessors, MIN_REVIEWS_TO_RANK, Ranked } from "@/helpers/rankings/rankings";

function RankingList<T>({ title, rows, href, label }: {
    title: string;
    rows: Ranked<T>[];
    href: (item: T) => string;
    label: (item: T) => string;
}) {
    const t = getDictionary();
    return (
        <section className="w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-3">{title}</h2>
            {rows.length === 0 ? (
                <p className="text-gray-600">{format(t.rankingsEmpty, { min: MIN_REVIEWS_TO_RANK })}</p>
            ) : (
                <ol className="bg-white rounded-lg shadow divide-y">
                    {rows.map((row, index) => (
                        <li key={href(row.item)} className="flex items-center gap-4 p-4">
                            <span className="text-xl font-bold w-8 text-right">{index + 1}</span>
                            <Link className="flex-1 underline" href={href(row.item)}>{label(row.item)}</Link>
                            <span className="text-right">
                                <span className="font-semibold">{row.average.toFixed(1)}</span>
                                <i className="fas fa-star text-yellow-500 ml-1" />
                                <span className="block text-sm text-gray-500">{format(t.reviewCount, { count: row.reviewCount })}</span>
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}

async function RankingsPage({ params }) {
    const t = getDictionary();
    const school = await getSchool(params.school);
    if (!school) {
        notFound();
    }
    const [professors, courses] = await Promise.all([getTopProfessors(school.id), getTopCourses(school.id)]);

    return (
        <main className="detail-page">
            <div className="detail-home">
                <HomeButton />
            </div>
            <div className="detail-search"><TopSearchSection /></div>

            <div className="text-center">
                <h1 className="text-4xl font-semibold pt-3">{format(t.rankingsTitle, { school: school.name })}</h1>
                <Link className="underline" href={schoolPath(school)}>{t.backToSchool}</Link>
            </div>

            <RankingList
                title={t.topProfessors}
                rows={professors}
                href={professorPath}
                label={(p) => [p.Prefix, p.Firstname, p.Lastname].filter(Boolean).join(" ")}
            />
            <RankingList
                title={t.topCourses}
                rows={courses}
                href={coursePath}
                label={(c) => (c.code ? `${c.code} ${c.name}` : c.name)}
            />
        </main>
    );
}

export default RankingsPage;
