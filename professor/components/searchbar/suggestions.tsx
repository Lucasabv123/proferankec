"use client"

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { Suggestion } from "@/helpers/search/suggest";
import { useDictionary } from "@/components/i18n/provider";

// Live matches under a search input: fetches a moment after typing stops, supports
// arrow keys, Enter and Escape, and leaves plain Enter to the caller's full search.
// `school` (a school key) limits professor and course matches to that university.
export function useSuggestions({ value, searchType, school, onSearch }: {
    value: string;
    searchType: string;
    school?: string;
    onSearch: () => void;
}) {
    const router = useRouter();
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loadedFor, setLoadedFor] = useState("");
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const listId = useId();
    const q = value.trim();
    const key = `${searchType}:${q}`;

    // a newer keystroke cancels the older request
    useEffect(() => {
        if (q.length < 2) {
            setSuggestions([]);
            setLoadedFor("");
            return;
        }
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ type: searchType, q });
                if (school) params.set("school", school);
                const res = await fetch(`/api/search/suggest?${params}`, { signal: controller.signal });
                const data = res.ok ? await res.json() : [];
                setSuggestions(Array.isArray(data) ? data : []);
                setLoadedFor(key);
                setActive(-1);
            } catch {
                // aborted by a newer keystroke, or offline; keep what is shown
            }
        }, 200);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [q, key, searchType, school]);

    const goTo = (suggestion: Suggestion) => {
        setOpen(false);
        router.push(suggestion.href);
    };

    const showList = open && q.length >= 2 && loadedFor === key;

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const showing = showList && suggestions.length > 0;
        if (e.key === "ArrowDown" && showing) {
            e.preventDefault();
            setActive((i) => (i + 1) % suggestions.length);
        } else if (e.key === "ArrowUp" && showing) {
            e.preventDefault();
            setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        } else if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
        } else if (e.key === "Enter") {
            if (showing && active >= 0) return goTo(suggestions[active]);
            setOpen(false);
            return onSearch();
        }
    };

    const inputProps = {
        onKeyDown,
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
        onInput: () => setOpen(true),
        role: "combobox",
        "aria-expanded": showList,
        "aria-controls": listId,
        "aria-autocomplete": "list" as const,
        "aria-activedescendant": showList && active >= 0 ? `${listId}-${active}` : undefined,
        autoComplete: "off",
    };

    return { inputProps, showList, suggestions, active, setActive, goTo, listId };
}

export function SuggestionList({ box, className = "" }: { box: ReturnType<typeof useSuggestions>; className?: string }) {
    const t = useDictionary();
    if (!box.showList) return null;
    return (
        <ul id={box.listId} role="listbox" className={`absolute left-0 right-0 z-20 mt-1 max-h-80 overflow-auto rounded-lg border border-gray-200 bg-white text-left text-black shadow-lg ${className}`}>
            {box.suggestions.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-500">{t.searchNoSuggestions}</li>
            )}
            {box.suggestions.map((s, i) => (
                <li
                    key={s.href}
                    id={`${box.listId}-${i}`}
                    role="option"
                    aria-selected={i === box.active}
                    // mousedown fires before the input's blur, which would close the list first
                    onMouseDown={(e) => { e.preventDefault(); box.goTo(s); }}
                    onMouseEnter={() => box.setActive(i)}
                    className={`cursor-pointer px-3 py-3 ${i === box.active ? "bg-blue-50" : ""}`}
                >
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-xs text-gray-500">{s.detail}</div>
                </li>
            ))}
        </ul>
    );
}
