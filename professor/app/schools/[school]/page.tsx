import { SearchBarAddOnPrimitive } from "@/components/searchbar/comp";
import getProfessors from "@/helpers/school/getprof";
import getCourses from "@/helpers/school/getcourse"; 
import ProfessorCard from "@/components/professor/card";    
import CourseCard from "@/components/course/card"; 
import TopSearchSection from "@/components/searchbar/topSection";
import HomeButton from "@/components/util/homeButton";
import { getDictionary } from "@/helpers/i18n/locale";
import getSchool from "@/helpers/school/getschool";
import { notFound } from "next/navigation";


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
    
     
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24"> 
        <div className = "absolute top-4 left-4">
            <HomeButton /> 
        </div>


        <div className="md:absolute md:top-4 md:right-4 flex flex-col justify-evenly"><TopSearchSection /> </div>
        <div>
            <h1 className="text-4xl font-semibold mb-4 pt-3">{school.name}</h1>
        </div>
        <SearchBarAddOnPrimitive placeholder={t.schoolSearchPlaceholder} buttonText={t.searchButton} />

        {searchData == null ? (<p>{t.couldNotFind}</p>) : (
            type === "professor" ? (
                <div className="flex flex-wrap justify-between space-x-3">
                    {searchData.map((professor : Professor) => (
                        <ProfessorCard key={professor.id} professor={professor} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap justify-between space-x-3">
                    {searchData.map((course) => (
                        <div key={course.id}>
                            <CourseCard course={course} />
                        </div>
                    ))}
                </div>
            )
        ) }


        
    </main>
  )
}


export default SchoolPage; 