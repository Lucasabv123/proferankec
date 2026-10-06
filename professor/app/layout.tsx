import { Inter, Merienda } from "next/font/google";
import "./globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css'

const inter = Inter({ subsets: ["latin"] });
const merienda = Merienda({ subsets: ["latin"] });

export const metadata = {
  title: "Professor Rank",
  description: "Rank your professors",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"/>   
      </head>
      <body className={`${merienda.className} bg-gray-50`}>{children}</body>
    </html>
  );
}
