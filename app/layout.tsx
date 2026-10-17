import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// next/font liefert die Schrift selbst aus: Kein Aufruf von Google beim Seitenbesuch (DSGVO).
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Standort-Check | Planeco Building",
  description: "Kostenloser Standort-Check für Ihr Grundstück",
};

export const viewport: Viewport = {
  themeColor: "#f2f5ea",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
