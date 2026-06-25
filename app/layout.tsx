import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BOUTIQUE_NOM, BOUTIQUE_DESCRIPTION } from "@/lib/constants";
import { Providers } from "./providers";
import { AgeGate } from "@/components/client/AgeGate";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
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
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          {children}
          <AgeGate />
        </Providers>
      </body>
    </html>
  );
}
