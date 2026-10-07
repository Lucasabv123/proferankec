import Link from "next/link";
import { getDictionary } from "@/helpers/i18n/locale";

export default function SiteFooter() {
  const t = getDictionary();
  return (
    <footer className="site-footer">
      <Link href="/privacy">{t.privacyPolicy}</Link>
      <Link href="/terms">{t.termsOfService}</Link>
    </footer>
  );
}
