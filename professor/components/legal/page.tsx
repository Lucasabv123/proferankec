import Link from "next/link";
import { getDictionary, getLocale } from "@/helpers/i18n/locale";
import { LEGAL_CONTACT, LEGAL_UPDATED } from "@/helpers/i18n/legal";

type LegalText = { title: string; intro: string; sections: { heading: string; paragraphs: string[] }[] };

export default function LegalPage({ text }: { text: Record<"en" | "es", LegalText> }) {
  const t = getDictionary();
  const { title, intro, sections } = text[getLocale()];
  return (
    <main className="legal-page">
      <Link href="/" className="text-sm font-medium text-blue-700 hover:underline">{t.backHome}</Link>
      <h1>{title}</h1>
      <p>{intro}</p>
      {sections.map(({ heading, paragraphs }) => (
        <section key={heading}>
          <h2>{heading}</h2>
          {paragraphs.map((p) => <p key={p}>{p}</p>)}
        </section>
      ))}
      <section>
        <h2>{t.legalContact}</h2>
        <p><a href={`mailto:${LEGAL_CONTACT}`}>{LEGAL_CONTACT}</a></p>
      </section>
      <p className="text-sm text-slate-500">{t.legalUpdated} {LEGAL_UPDATED}</p>
    </main>
  );
}
