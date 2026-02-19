import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VOID BREAKER",
  description: "Space shooter RPG — 3 sectors, 3 bosses, 8 skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-[#00030a] text-white font-mono">
        {children}
      </body>
    </html>
  );
}
