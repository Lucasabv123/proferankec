import { SearchBarAddOnPrimitive } from "@/components/searchbar/comp";
import getProfessors from "@/helpers/school/getprof";
import getCourses from "@/helpers/school/getcourse"; 
import ProfessorCard from "@/components/professor/card";    
import CourseCard from "@/components/course/card"; 
import SiteHeader from "@/components/layout/siteHeader";
import { getServerSession } from "next-auth";
import authOptions from "@/helpers/auth/options";
import { getDictionary } from "@/helpers/i18n/locale";
import getSchool from "@/helpers/school/getschool";
import { notFound } from "next/navigation";
import Link from "next/link";
import { schoolPath } from "@/helpers/links";


type Professor = {
    id: number; 
    Prefix?: string; 
    Firstname: string; 
    Lastname: string; 
    Verified?: boolean; 
}


async function getSearch(schoolId : number, type? : string, search? : string){
    if(!type || !search){
        return;
    }
    let data = []; 
    if(type === "professor"){
        data = await getProfessors(schoolId, search);
    }else if(type === "course"){
        data = await getCourses(schoolId, search);
    }else{
        return; 
    }
    return data; 
}

async function SchoolPage( {params, searchParams }) {

    const t = getDictionary();
    const school = await getSchool(params.school);
    if (!school) {
        notFound();
    }
    const search = searchParams?.q; 
    const type = searchParams?.type;
    const searchData: any = await getSearch(school.id, type, search); 
    const session = await getServerSession(authOptions);
    
     
  return (
    <>
    <SiteHeader session={session} />
    <main className="flex min-h-screen flex-col items-center gap-6 px-4 py-6 md:p-12 max-w-5xl mx-auto w-full"> 
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-semibold mb-2">{school.name}</h1>
            <Link className="underline" href={`${schoolPath(school)}/rankings`}>{t.seeRankings}</Link>
        </div>
        <SearchBarAddOnPrimitive placeholder={t.schoolSearchPlaceholder} buttonText={t.searchButton} school={school.key} />

        {searchData == null ? null : searchData.length === 0 ? (<p>{t.couldNotFind}</p>) : (
            type === "professor" ? (
                <div className="grid w-full grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                    {searchData.map((professor : Professor) => (
                        <ProfessorCard key={professor.id} professor={professor} />
                    ))}
                </div>
            ) : (
                <div className="grid w-full grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                    {searchData.map((course) => (
                        <div key={course.id}>
                            <CourseCard course={course} />
                        </div>
                    ))}
                </div>
            )
        ) }
    </main>
    </>
  )
}


export default SchoolPage; 