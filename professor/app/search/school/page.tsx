import { getDictionary } from "@/helpers/i18n/locale";
import SiteHeader from "@/components/layout/siteHeader";
import { getServerSession } from "next-auth";
import authOptions from "@/helpers/auth/options";
import SearchInner from '@/components/searchPages/school';

export default async function Search() {
  const t = getDictionary();
  const session = await getServerSession(authOptions);
  return (
    <>
    <SiteHeader session={session} showSearch={false} />
    <main className="flex min-h-screen flex-col items-center px-4 py-6 md:p-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">
        {t.searchAllHeading}
      </h1>
      <SearchInner />
    </main>
    </>
  );
}
