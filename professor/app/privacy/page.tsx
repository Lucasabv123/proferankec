import LegalPage from "@/components/legal/page";
import { privacy } from "@/helpers/i18n/legal";
import { getLocale } from "@/helpers/i18n/locale";
import { BRAND_NAME } from "@/helpers/i18n/dictionaries";

export function generateMetadata() {
  return { title: `${privacy[getLocale()].title} | ${BRAND_NAME}` };
}

export default function Privacy() {
  return <LegalPage text={privacy} />;
}
