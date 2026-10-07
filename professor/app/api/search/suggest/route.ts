import { NextResponse, NextRequest } from "next/server";
import getSuggestions, { SuggestType } from "@/helpers/search/suggest";

const types: SuggestType[] = ["professor", "course", "school"];

// GET /api/search/suggest?type=professor&q=perez -> up to 8 { label, detail, href }
async function handler(req: NextRequest) {
    const params = new URL(req.url).searchParams;
    const q = (params.get("q") ?? "").trim().slice(0, 100);
    const type = params.get("type") as SuggestType;
    if (!types.includes(type)) {
        return NextResponse.json({ error: "Unknown search type" }, { status: 400 });
    }
    if (q.length < 2) return NextResponse.json([]);

    try {
        return NextResponse.json(await getSuggestions(type, q));
    } catch (e) {
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";
export { handler as GET };
