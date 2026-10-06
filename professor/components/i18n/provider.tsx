"use client";

import { createContext, useContext } from "react";
import { en, Dictionary } from "@/helpers/i18n/dictionaries";

const DictionaryContext = createContext<Dictionary>(en);

export function DictionaryProvider({ dictionary, children }: { dictionary: Dictionary; children: React.ReactNode }) {
    return <DictionaryContext.Provider value={dictionary}>{children}</DictionaryContext.Provider>;
}

// UI text for the visitor's language, picked on the server from their browser settings
export function useDictionary(): Dictionary {
    return useContext(DictionaryContext);
}
