import type { Metadata } from "next";
import { Inter, JetBrains_Mono, VT323 } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});
const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "CoreStack Prompt Builder",
  description: "Generate AI-ready bootstrap prompts for new admin dashboards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${vt323.variable} font-mono bg-black text-green-500 antialiased overflow-x-hidden`}>
        <div className="crt-overlay pointer-events-none fixed inset-0 z-50"></div>
        <div className="scanline pointer-events-none fixed inset-0 z-50"></div>
        <div className="vignette pointer-events-none fixed inset-0 z-40"></div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
