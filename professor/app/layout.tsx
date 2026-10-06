import { Inter, Merienda } from "next/font/google";
import "./globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css'
import { getLocale } from "@/helpers/i18n/locale";
import { dictionaries } from "@/helpers/i18n/dictionaries";
import { DictionaryProvider } from "@/components/i18n/provider";

const inter = Inter({ subsets: ["latin"] });
const merienda = Merienda({ subsets: ["latin"] });

export async function generateMetadata() {
  const t = dictionaries[getLocale()];
  return {
    title: t.appName,
    description: t.appDescription,
  };
}

export default function RootLayout({ children }) {
  const locale = getLocale();
  return (
    <html lang={locale}>
      <head>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"/>   
      </head>
      <body className={`${merienda.className} bg-gray-50`}>
        <DictionaryProvider dictionary={dictionaries[locale]}>{children}</DictionaryProvider>
      </body>
    </html>
  );
}
