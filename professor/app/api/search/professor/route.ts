import { NextResponse, NextRequest } from "next/server"; 
import searchProfessors from "@/helpers/search/professorsearch";

async function handler(req: NextRequest) {
    try{
        const serachParams = new URL(req.url).searchParams;
        const search = serachParams.get("q");
        if(!search){
            return NextResponse.error();
        }
        console.log(search);

        const professors = await searchProfessors(search);
        return NextResponse.json(professors);
    } catch(e){
        console.log(e);
        return NextResponse.error();
    }
}


export {handler as GET}