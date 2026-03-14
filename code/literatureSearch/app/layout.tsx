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
  const buildTimestamp = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP;
  const formattedBuildTime = buildTimestamp
    ? new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZoneName: "short",
      }).format(new Date(buildTimestamp))
    : null;

  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        {children}
        <div className="fixed bottom-3 left-3 z-50 max-w-[calc(100vw-1.5rem)] rounded-xl border border-white/15 bg-slate-950/85 px-3 py-2 text-[11px] text-slate-200 shadow-lg backdrop-blur-sm">
          <p className="font-semibold tracking-wide text-slate-100">
            <span className="sr-only">Current build </span>
            Build {buildId}
          </p>
          {formattedBuildTime ? (
            <p className="mt-0.5 text-[10px] text-slate-300">
              Built {formattedBuildTime}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
