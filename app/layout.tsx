import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import "./retro-clinical.css";
import "./intake-clinical.css";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-serif",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GLP-1 Precision Dosing | First Dose",
  description:
    "Personalized GLP-1 dosing guidance built around your biology — clinician-support report.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${libreBaskerville.variable} ${ibmPlexMono.variable} font-sans antialiased`}
      >
        {children}
        <div className="site-footer-wrap">
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
