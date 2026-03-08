import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chess Opening Explorer",
  description:
    "Explore chess openings by style, character, and complexity. Interactive boards, Lichess stats, and strategic key ideas.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#09090b] text-[#fafafa] antialiased">
        {children}
      </body>
    </html>
  );
}
