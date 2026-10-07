"use client";

import { useState } from "react";
import { SearchBarPrimitive } from "@/components/searchbar/comp";
import { useDictionary } from "@/components/i18n/provider";

type SearchType = "professor" | "course" | "school";

// one search box with a professor/course/school picker, so the header fits on a phone
const HeaderSearch = ({ defaultType = "professor" }: { defaultType?: SearchType }) => {
    const t = useDictionary();
    const [type, setType] = useState<SearchType>(defaultType);
    const placeholders: Record<SearchType, string> = {
        professor: t.searchProfessorsPlaceholder,
        course: t.searchCoursesPlaceholder,
        school: t.searchSchoolsPlaceholder,
    };

    return (
        <div className="relative flex gap-2 w-full">
            <select
                value={type}
                onChange={(e) => setType(e.target.value as SearchType)}
                aria-label={t.searchCategory}
                className="shrink-0 max-w-[8.5rem] rounded-lg border border-gray-300 bg-white px-2 py-2 text-base md:py-1 md:text-sm"
            >
                <option value="professor">{t.professors}</option>
                <option value="course">{t.courses}</option>
                <option value="school">{t.schools}</option>
            </select>
            <div className="flex-1 min-w-0">
                <SearchBarPrimitive key={type} searchType={type} placeholder={placeholders[type]} buttonText={t.searchButton} size="small" listUnderParent />
            </div>
        </div>
    );
};

export default HeaderSearch;
