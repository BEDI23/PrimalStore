import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { BOUTIQUE_NOM, BOUTIQUE_DESCRIPTION } from "@/lib/constants";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://plamastore.net",
  ),
  title: `${BOUTIQUE_NOM} — Boutique en ligne à Lomé`,
  description: BOUTIQUE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${sora.variable} font-sans`}>
        <Providers>
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
