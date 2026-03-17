/**
 * app/layout.tsx
 *
 * Root layout — wraps every page in the app.
 *
 * - Loads the Geist font (set up by create-next-app)
 * - Sets global metadata
 * - Applies the base dark-theme classes to <body>
 *
 * Route-group layouts (e.g. (dashboard)/layout.tsx) layer their own
 * structural chrome (sidebar nav, etc.) on top of this shell.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "@/components/providers/ThemeProvider";
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
  title: "MetriX — Life Metrics Dashboard",
  description: "Track your life metrics with weighted hierarchical scoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
