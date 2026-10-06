
import schoolSearch from "@/helpers/search/schoolsearch";
import { NextResponse, NextRequest } from "next/server";

async function handler(req: NextRequest){
    
    try{
        const searchParams = new URL(req.url).searchParams;
        console.log("made it here");
        const search = searchParams.get("q");
        if(!search){
            return NextResponse.json({error: "No search query provided", status: 400});
        }

        const schools = await schoolSearch(search);
        console.log(schools)
        
        return NextResponse.json(schools); 
    }catch(e: any){
        console.log(e); 
        return NextResponse.json({error: e.message, status: 500}); 
    }

}


export {handler as GET}; 

