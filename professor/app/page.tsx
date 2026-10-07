import Login from "@/components/auth/loginformbasicgoogle01";
import SearchBar from "@/components/searchbar/comp";
import { getServerSession } from "next-auth";
import authOptions from "@/helpers/auth/options";
import HomeButton from "@/components/util/homeButton";
import { getDictionary } from "@/helpers/i18n/locale";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const t = getDictionary();
  const searches = [
    { type: "professor" as const, title: t.professorsSearch },
    { type: "course" as const, title: t.coursesSearch },
    { type: "school" as const, title: t.schoolSearch },
  ];

  return (
    <main className="home-shell">
      <header className="home-header">
        <div className="home-header-inner">
        <div className="home-brand">
          <HomeButton size={42} disabled />
          <span className="text-lg font-bold tracking-tight md:text-xl">{t.appName}</span>
        </div>
        <Login showLogin={!session} user={session?.user} />
        </div>
      </header>
      <section className="home-content" aria-labelledby="home-heading">
        <div className="home-intro">
          <h1 id="home-heading">{t.homeHeading}</h1>
        </div>
        <div className="home-searches">
          {searches.map(({ type, title }) => (
            <section className="search-panel" key={type} aria-labelledby={`${type}-heading`}>
              <h2 id={`${type}-heading`}>{title}</h2>
              <SearchBar type={type} />
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
