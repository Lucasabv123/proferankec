import { SearchBarAddOnPrimitive } from "@/components/searchbar/comp";
import getProfessors from "@/helpers/school/getprof";
import getCourses from "@/helpers/school/getcourse"; 
import ProfessorCard from "@/components/professor/card";    
import CourseCard from "@/components/course/card"; 
import TopSearchSection from "@/components/searchbar/topSection";
import HomeButton from "@/components/util/homeButton";


type Course = {
    name: string; 
    School: string;
    description: string;
    Department: string; 
}
type Professor = {
    id: number; 
    Prefix?: string; 
    Firstname: string; 
    Lastname: string; 
    Verified?: boolean; 
}


async function getSearch(school : string, type? : string, search? : string){
    if(!type || !search){
        console.log("no type or search");
        return;
    }
    let data = []; 
    if(type === "professor"){
        console.log("professor");
        data = await getProfessors(school, search);
    }else if(type === "course"){
        console.log("course");
        data = await getCourses(school, search);
        console.log(data); 
    }else{
        return; 
    }
    return data; 
}

async function SchoolPage( {params, searchParams }) {

    const school = decodeURI(params.school);  
    const search = searchParams?.q; 
    const type = searchParams?.type;
    const searchData: any = await getSearch(school, type, search); 
    // if the search data is a course we need to add the school to the course object
    if(searchData && searchData[0] && searchData[0].description){
        searchData.forEach((course : Course) => {
            course.School = school;
        })
    }
    
    console.log(searchData); 
     
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24"> 
        <div className = "absolute top-4 left-4">
            <HomeButton /> 
        </div>


        <div className="md:absolute md:top-4 md:right-4 flex flex-col justify-evenly"><TopSearchSection /> </div>
        <div>
            <h1 className="text-4xl font-semibold mb-4 pt-3">{school}</h1>
        </div>
        <SearchBarAddOnPrimitive  placeholder="Search for course/professor" />

        {searchData == null ? (<p>Could not find any results</p>) : (
            type === "professor" ? (
                <div className="flex flex-wrap justify-between space-x-3">
                    {searchData.map((professor : Professor, index) => (
                        <ProfessorCard key={index} professor={professor} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap justify-between space-x-3">
                    {searchData.map((course: Course, index) => (
                        <div>
                            <CourseCard key={index} course={course} />
                        </div>
                    ))}
                </div>
            )
        ) }


        
    </main>
  )
}


export default SchoolPage; 