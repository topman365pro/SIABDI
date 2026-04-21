import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { QueryProvider } from "@/components/shared/query-provider";
import "./globals.css";

const fontSans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Sistem Absensi Sekolah",
  description: "Dashboard absensi terintegrasi untuk sekolah"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${fontSans.variable} ${fontMono.variable} bg-canvas font-sans text-ink`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
