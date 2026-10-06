
import Login from "@/components/auth/loginformbasicgoogle01";
import SearchBar  from "@/components/searchbar/comp"; 

import { getServerSession } from "next-auth"; 
import authOptions from "@/helpers/auth/options";
import HomeButton from '@/components/util/homeButton';

interface TopBannerProps {
  session: any;
}


const TopBanner: React.FC<TopBannerProps> = ({ session }) => {
  return (
    <header className="w-full bg-blue-700 text-white p-4 md:p-6 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <HomeButton size={60} disabled={true} />
          <h1 className="text-xl md:text-2xl font-bold">Professor Rank</h1>
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

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      {/* Top Bar with Login Button */}
      <TopBanner session={session} />
      
      {/* Centered Content */}
      <div className="flex flex-col items-center justify-center flex-grow space-y-8 md:space-y-0">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Search Professors and Courses</h1>
        <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
          <div className="flex flex-col items-center">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Professors Search</h2>
            <SearchBar type="professor" />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Courses Search</h2>
            <SearchBar type="course" />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-lg md:text-xl font-semibold mb-4">School Search</h2>
            <SearchBar type="school" />
          </div>
        </div>
      </div>
    </main>
  );
}

