import type { Metadata } from "next";
import "./globals.css";

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
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Source+Sans+3:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
