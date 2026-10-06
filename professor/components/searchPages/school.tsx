"use client"; 
import { useSearchParams } from 'next/navigation'; 
import SchoolCard from '@/components/school/card';
import SearchBar from '@/components/searchbar/comp';
import useSWR from 'swr'; 

type School = {
    School: string; 
}

const fetcher = async (url: string) => {
    const res = await fetch(url); 
    return res.json(); 
}

const SearchInner : React.FC = () => {
    const search = useSearchParams(); 

    const searchQ = search ? search.get("q") : ""; 
    const {data, error} = useSWR(`/api/search/school?q=${searchQ}`, fetcher);
    // set of data to remove duplicates
    const list = data ? Array.from(new Set(data.map((school: School) => school.School)))
                        .map(schoolName => data.find((school: School) => school.School === schoolName))
                        : [];
     
    
    
    return(
    <>
        <div className ="flex space-x-8"> 
            <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Professor Search</h2>
            <SearchBar type="professor" size ="small"/>

            </div>
            <div  className="flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4">Courses Search</h2>
                <SearchBar type="course" size ="small"/>

            </div>
            <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">School Search</h2>
            <SearchBar type="school" size ="small" onPage={true} placeholder={searchQ} />
            </div>
            
        </div>
        <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Schools</h2>
            <div className="flex flex-wrap justify-center">
                {data ? list.map((school: School, index: number) => (
                    <SchoolCard key={index} school={school.School} />
                )) : <p>could not find</p>}
            </div>
        
        </div>

    </>
    ); 
}; 

export default SearchInner; 