import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "ScreenCopy.ai - AI App Store Screenshot Copy Generator",
    template: "%s | ScreenCopy.ai",
  },
  description: "Generate high-converting App Store screenshot copy in seconds using Advanced Vision AI. Analyze your UI and get optimized marketing text instantly.",
  keywords: ["App Store Optimization", "ASO", "Screenshot Copy", "AI Copywriting", "Vision AI", "Mobile App Marketing"],
  authors: [{ name: "ScreenCopy Team" }],
  creator: "ScreenCopy.ai",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://screencopy.ai",
    title: "ScreenCopy.ai - AI App Store Screenshot Copy Generator",
    description: "Generate high-converting App Store screenshot copy in seconds using Advanced Vision AI.",
    siteName: "ScreenCopy.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScreenCopy.ai - AI App Store Screenshot Copy Generator",
    description: "Generate high-converting App Store screenshot copy in seconds using Advanced Vision AI.",
    creator: "@screencopyai",
  },
  metadataBase: new URL('https://screencopy.ai'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
