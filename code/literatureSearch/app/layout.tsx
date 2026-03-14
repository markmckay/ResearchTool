import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const headingFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-heading",
});

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Research Literature Search",
  description: "Accessible academic paper search tool — Semantic Scholar + OpenAlex",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const buildId = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";

  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        {children}
        <div className="fixed bottom-3 right-3 z-50 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[11px] text-muted backdrop-blur-sm">
          <span className="sr-only">Current build </span>
          Build {buildId}
        </div>
      </body>
    </html>
  );
}
