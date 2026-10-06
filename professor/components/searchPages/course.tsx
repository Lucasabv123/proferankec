"use client";
import { useSearchParams } from "next/navigation";
import CourseCard from "@/components/course/card";
import SearchBar from "@/components/searchbar/comp";
import useSWR from "swr";

type Course = {
  id: number;
  name?: string;
  description?: string;
  School?: string;
  Department?: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  return res.json();
};

const SearchInner: React.FC = () => {
  const search = useSearchParams();
  const searchQ = search ? search.get("q") : "";

  const { data, error } = useSWR(`/api/search/course?q=${searchQ}`, fetcher);

  return (
    <>
      {/* Make search bars stack vertically on mobile and horizontally on larger screens */}
      <div className="flex flex-col space-y-8 md:flex-row md:space-y-0 md:space-x-8 mb-8 w-full justify-center">
        <div className="flex flex-col items-center">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Professors Search</h2>
          <SearchBar type="professor" size="small" />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Courses Search</h2>
          <SearchBar
            type="course"
            size="small"
            onPage={true}
            placeholder={searchQ}
          />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-lg md:text-xl font-semibold mb-4">School Search</h2>
          <SearchBar type="school" size="small" />
        </div>
      </div>

      {/* Make the courses list responsive */}
      <div className="w-full px-4 sm:px-0">
        {data && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((course: Course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-center text-lg">No courses available.</p>
        )}
      </div>
    </>
  );
};

export default SearchInner;
