import { getDictionary } from "@/helpers/i18n/locale";
import SearchInner from "@/components/searchPages/course";

export default function Search() {
  const t = getDictionary();
  return (
    <main className="results-page">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">
        {t.homeHeading}
      </h1>
      <SearchInner />
    </main>
  );
}
