
import Login from "@/components/auth/loginformbasicgoogle01";
import SearchBar  from "@/components/searchbar/comp"; 

import { getServerSession } from "next-auth"; 
import authOptions from "@/helpers/auth/options";
import HomeButton from '@/components/util/homeButton';
import { getDictionary } from "@/helpers/i18n/locale";

interface TopBannerProps {
  session: any;
}


const TopBanner: React.FC<TopBannerProps> = ({ session }) => {
  return (
    <header className="w-full bg-blue-700 text-white px-4 py-4 md:p-6 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <HomeButton size={48} disabled={true} />
          <h1 className="text-xl md:text-2xl font-bold">{getDictionary().appName}</h1>
        </div>
        <div>
          {session ? (
            <Login showLogin={false} user={session.user} />
          ) : (
            <Login showLogin={true} />
          )}
        </div>
      </div>
    </header>
  );
};



export default async function Home() {
  const session = await getServerSession(authOptions); 
  const t = getDictionary();

  return (
    <main className="flex min-h-screen flex-col">
      {/* Top Bar with Login Button */}
      <TopBanner session={session} />
      
      {/* Centered Content */}
      <div className="flex flex-col items-center justify-center flex-grow px-4 py-8 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">{t.homeHeading}</h1>
        <div className="flex flex-col w-full max-w-md md:max-w-none md:w-auto md:flex-row gap-8">
          <div className="flex flex-col items-center w-full md:w-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-4">{t.professorsSearch}</h2>
            <SearchBar type="professor" />
          </div>
          <div className="flex flex-col items-center w-full md:w-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-4">{t.coursesSearch}</h2>
            <SearchBar type="course" />
          </div>
          <div className="flex flex-col items-center w-full md:w-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-4">{t.schoolSearch}</h2>
            <SearchBar type="school" />
          </div>
        </div>
      </div>
    </main>
  );
}

