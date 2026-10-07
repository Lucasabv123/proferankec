import LegalPage from "@/components/legal/page";
import { terms } from "@/helpers/i18n/legal";
import { getLocale } from "@/helpers/i18n/locale";
import { BRAND_NAME } from "@/helpers/i18n/dictionaries";

export function generateMetadata() {
  return { title: `${terms[getLocale()].title} | ${BRAND_NAME}` };
}

export default function Terms() {
  return <LegalPage text={terms} />;
}
