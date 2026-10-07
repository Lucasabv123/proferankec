import { Locale } from "../i18n/dictionaries";

// the translationapi/ service; the Translate button is hidden when this isn't set
const API_URL = process.env.TRANSLATION_API_URL;
const API_KEY = process.env.TRANSLATION_API_KEY;
const TIMEOUT_MS = 30_000; // a cold start on Lambda loads the models first

export function isTranslationEnabled(): boolean {
    return !!API_URL;
}

// comments are written in English or Spanish, so the source is whichever language the reader isn't using
export function otherLanguage(language: Locale): Locale {
    return language === "es" ? "en" : "es";
}

export async function translateText(text: string, source: Locale, target: Locale): Promise<string> {
    if (!API_URL) {
        throw new Error("TRANSLATION_API_URL is not set");
    }
    const res = await fetch(`${API_URL.replace(/\/+$/, "")}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(API_KEY ? { "X-API-Key": API_KEY } : {}) },
        body: JSON.stringify({ text, source, target }),
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
        throw new Error(`Translation API returned ${res.status}`);
    }
    const data = await res.json();
    if (typeof data?.translation !== "string") {
        throw new Error("Translation API returned no translation");
    }
    return data.translation;
}
