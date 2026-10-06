"use client";
import { useSearchParams } from "next/navigation";
import ProfessorCard from "@/components/professor/card";
import SearchBar from "@/components/searchbar/comp";
import useSWR from "swr";

type Professor = {
  id: number;
  Firstname?: string;
  Lastname?: string;
  Prefix?: string;
  Verified?: boolean;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  return res.json();
};

const SearchInner: React.FC = () => {
  const search = useSearchParams();
  const searchQ = search ? search.get("q") : "";
  const { data, error } = useSWR(`/api/search/professor?q=${searchQ}`, fetcher);

  return (
    <>
      {/* Responsive search bars */}
      <div className="flex flex-col space-y-8 md:flex-row md:space-y-0 md:space-x-8 mb-8 w-full justify-center">
        <div className="flex flex-col items-center">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Professors Search</h2>
          <SearchBar
            type="professor"
            size="small"
            onPage={true}
            placeholder={searchQ}
          />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Courses Search</h2>
          <SearchBar type="course" size="small" />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-lg md:text-xl font-semibold mb-4">School Search</h2>
          <SearchBar type="school" size="small" />
        </div>
      </div>

      {/* Responsive Professor Cards */}
      <div className="w-full px-4 sm:px-0">
        {data && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((professor: Professor) => (
              <ProfessorCard key={professor.id} professor={professor} />
            ))}
          </div>
        ) : (
          <p className="text-center text-lg">No professors available.</p>
        )}
      </div>
    </>
  );
};

export default SearchInner;
