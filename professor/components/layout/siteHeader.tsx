import Link from "next/link";
import Image from "next/image";
import Login from "@/components/auth/loginformbasicgoogle01";
import HeaderSearch from "@/components/searchbar/topSection";
import { getDictionary } from "@/helpers/i18n/locale";

interface SiteHeaderProps {
  session: any;
  showSearch?: boolean;
}

// top bar shared by every inner page: logo, one search box, and sign-in.
// On phones the search drops to its own full-width row under the logo.
const SiteHeader = ({ session, showSearch = true }: SiteHeaderProps) => {
  const t = getDictionary();
  return (
    <header className="w-full border-b border-slate-200 bg-white text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 md:flex-nowrap">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/professor-rank-logo.png" alt="" width={36} height={36} />
          <span className="font-bold text-lg">{t.appName}</span>
        </Link>
        {showSearch ? (
          <div className="order-last w-full md:order-none md:w-auto md:flex-1 text-black">
            <HeaderSearch />
          </div>
        ) : (
          <div className="hidden md:block md:flex-1" />
        )}
        <div className="ml-auto shrink-0">
          {session ? <Login showLogin={false} user={session.user} compact /> : <Login showLogin={true} compact />}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
