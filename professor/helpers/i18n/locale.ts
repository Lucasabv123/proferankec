import { headers } from "next/headers";
import { dictionaries, Locale, Dictionary } from "./dictionaries";

// Spanish when the browser doesn't ask for a language we have, since our users are in Ecuador
export const DEFAULT_LOCALE: Locale = "es";

// picks the first supported language from an Accept-Language header such as "en-US,en;q=0.9,es;q=0.8"
export function pickLocale(acceptLanguage: string | null): Locale {
    if (!acceptLanguage) return DEFAULT_LOCALE;
    const ranked = acceptLanguage
        .split(",")
        .map((part) => {
            const [tag, ...params] = part.trim().split(";");
            const q = params.find((p) => p.trim().startsWith("q="));
            return { lang: tag.trim().toLowerCase().split("-")[0], q: q ? parseFloat(q.split("=")[1]) : 1 };
        })
        .filter(({ lang, q }) => lang && q > 0)
        .sort((a, b) => b.q - a.q);
    const match = ranked.find(({ lang }) => lang in dictionaries);
    return match ? (match.lang as Locale) : DEFAULT_LOCALE;
}

export function getLocale(): Locale {
    return pickLocale(headers().get("accept-language"));
}

export function getDictionary(): Dictionary {
    return dictionaries[getLocale()];
}
