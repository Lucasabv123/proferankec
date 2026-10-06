import { NextResponse, NextRequest } from "next/server"; 
import  searchCourses  from "@/helpers/search/coursesearch";
async function handler(req: NextRequest) {
    try{
        const serachParams = new URL(req.url).searchParams;
        const search = serachParams.get("q");
        if(!search){
            return NextResponse.error();
        }
        console.log(search);

        const courses = await searchCourses(search);
        return NextResponse.json(courses);
    } catch(e){
        console.log(e);
        return NextResponse.error();
    }
}


export {handler as GET}