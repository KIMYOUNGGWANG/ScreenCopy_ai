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
    images: [
      {
        url: 'https://screencopy.ai/og-image.png', // Placeholder, user should replace this
        width: 1200,
        height: 630,
        alt: 'ScreenCopy.ai Preview',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScreenCopy.ai - AI App Store Screenshot Copy Generator",
    description: "Generate high-converting App Store screenshot copy in seconds using Advanced Vision AI.",
    creator: "@screencopyai",
    images: ['https://screencopy.ai/og-image.png'],
  },
  metadataBase: new URL('https://screencopy.ai'),
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
