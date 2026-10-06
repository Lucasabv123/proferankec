import { getDictionary } from "@/helpers/i18n/locale";
import SearchInner from '@/components/searchPages/school';

export default function Search() {
  const t = getDictionary();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">
        {t.searchAllHeading}
      </h1>
      <SearchInner />
    </main>
  );
}
