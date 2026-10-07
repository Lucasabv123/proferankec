import { NextResponse, NextRequest } from "next/server";
import getSuggestions, { SuggestType } from "@/helpers/search/suggest";
import getSchool from "@/helpers/school/getschool";

const types: SuggestType[] = ["professor", "course", "school"];

// GET /api/search/suggest?type=professor&q=perez[&school=usfq] -> up to 8 { label, detail, href }
async function handler(req: NextRequest) {
    const params = new URL(req.url).searchParams;
    const q = (params.get("q") ?? "").trim().slice(0, 100);
    const type = params.get("type") as SuggestType;
    if (!types.includes(type)) {
        return NextResponse.json({ error: "Unknown search type" }, { status: 400 });
    }
    if (q.length < 2) return NextResponse.json([]);

    try {
        const schoolKey = params.get("school");
        let schoolId: number | undefined;
        if (schoolKey) {
            const school = await getSchool(schoolKey);
            if (!school) return NextResponse.json([]);
            schoolId = school.id;
        }
        return NextResponse.json(await getSuggestions(type, q, schoolId));
    } catch (e) {
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";
export { handler as GET };
