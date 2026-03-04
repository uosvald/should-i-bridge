import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Should I Bridge My USDC to Solana? | Free Calculator | Yieldy",
  description:
    "Calculate your real USDC yield after gas and bridging costs. Compare Ethereum vs Solana yields at your deposit size. Free, no wallet needed.",
  openGraph: {
    title: "Should I Bridge My USDC to Solana?",
    description:
      "Calculate your real USDC yield after gas and bridging costs. Compare Ethereum vs Solana yields at your deposit size.",
    url: "https://bridge.yieldy.io",
    siteName: "Yieldy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Should I Bridge My USDC to Solana?",
    description:
      "Calculate your real USDC yield after gas and bridging costs. Free, no wallet needed.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#1A1A2E] text-white min-h-screen`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
