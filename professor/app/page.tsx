import Login from "@/components/auth/loginformbasicgoogle01";
import SearchBar from "@/components/searchbar/comp";
import { getServerSession } from "next-auth";
import authOptions from "@/helpers/auth/options";
import HomeButton from "@/components/util/homeButton";
import { getDictionary } from "@/helpers/i18n/locale";
import { AcademicCapIcon, BookOpenIcon, BuildingLibraryIcon } from "@heroicons/react/24/outline";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const t = getDictionary();
  const searches = [
    { type: "professor" as const, title: t.professorsSearch, hint: t.professorHint, iconClass: "search-icon-professor", Icon: AcademicCapIcon },
    { type: "course" as const, title: t.coursesSearch, hint: t.courseHint, iconClass: "search-icon-course", Icon: BookOpenIcon },
    { type: "school" as const, title: t.schoolSearch, hint: t.schoolHint, iconClass: "search-icon-school", Icon: BuildingLibraryIcon },
  ];

  return (
    <main className="home-shell">
      <header className="home-header">
        <div className="home-brand">
          <HomeButton size={42} disabled />
          <span className="text-lg font-bold tracking-tight md:text-xl">{t.appName}<span className="brand-dot">.</span></span>
        </div>
        <Login showLogin={!session} user={session?.user} />
      </header>
      <section className="home-content" aria-labelledby="home-heading">
        <div className="home-intro">
          <p className="eyebrow">{t.homeEyebrow}</p>
          <h1 id="home-heading">{t.homeHeading}</h1>
          <p className="home-description">{t.homeDescription}</p>
        </div>
        <div className="home-searches">
          {searches.map(({ type, title, hint, iconClass, Icon }) => (
            <section className="search-panel" key={type} aria-labelledby={`${type}-heading`}>
              <span className={`search-icon ${iconClass}`}><Icon aria-hidden="true" /></span>
              <h2 id={`${type}-heading`}>{title}</h2>
              <p>{hint}</p>
              <SearchBar type={type} />
            </section>
          ))}
        </div>
        <p className="browse-note">{t.browseNote}</p>
      </section>
    </main>
  );
}
