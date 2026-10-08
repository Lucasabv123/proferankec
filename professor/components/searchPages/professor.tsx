"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProfessorCard from "@/components/professor/card";
import SearchBar from "@/components/searchbar/comp";
import useSWR from "swr";
import { useDictionary } from "@/components/i18n/provider";

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
  const t = useDictionary();
  const search = useSearchParams();
  const searchQ = search ? search.get("q") : "";
  const { data, error } = useSWR(`/api/search/professor?q=${encodeURIComponent(searchQ ?? "")}`, fetcher);

  return (
    <>
      {/* Responsive search bars */}
      <div className="results-searches">
        <div className="flex flex-col items-center">
          <h2 className="text-lg md:text-xl font-semibold mb-4">{t.professorsSearch}</h2>
          <SearchBar
            type="professor"
            size="small"
            onPage={true}
            placeholder={searchQ}
          />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-lg md:text-xl font-semibold mb-4">{t.coursesSearch}</h2>
          <SearchBar type="course" size="small" />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-lg md:text-xl font-semibold mb-4">{t.schoolSearch}</h2>
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
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-lg">{t.noProfessors}</p>
            {data && <Link className="font-semibold text-blue-700 underline" href="/suggest">{t.suggestLink}</Link>}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchInner;
