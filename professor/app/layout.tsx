import { Inter } from "next/font/google";
import "./globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css'
import { getLocale } from "@/helpers/i18n/locale";
import { dictionaries } from "@/helpers/i18n/dictionaries";
import { DictionaryProvider } from "@/components/i18n/provider";

const inter = Inter({ subsets: ["latin"] });


export async function generateMetadata() {
  const t = dictionaries[getLocale()];
  return {
    title: t.appName,
    description: t.appDescription,
    icons: { icon: { url: "/professor-rank-logo.png", type: "image/png" }, apple: "/professor-rank-logo.png" },
  };
}

export default function RootLayout({ children }) {
  const locale = getLocale();
  return (
    <html lang={locale}>
      <body className={`${inter.className}`}>
        <DictionaryProvider dictionary={dictionaries[locale]}>{children}</DictionaryProvider>
      </body>
    </html>
  );
}
