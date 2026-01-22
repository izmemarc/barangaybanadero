import React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

// Using system fonts to avoid Google Fonts dependency
const fontVariables: React.CSSProperties = {
  "--font-inter": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  "--font-playfair": "Georgia, 'Times New Roman', serif",
  "--font-montserrat": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
} as React.CSSProperties;

export const metadata: Metadata = {
  title: "Banadero, Legazpi City - Official Website",
  description: "Official website of Banadero, Legazpi City - Serving our community with excellence",
  generator: "v0.app",
  icons: {
    icon: [
      { url: '/logo.webp', type: 'image/webp' },
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  other: {
    'preconnect': 'https://fonts.googleapis.com',
    'dns-prefetch': 'https://fonts.gstatic.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/webp" href="/logo.webp" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="font-sans" style={{...fontVariables, backgroundColor: '#F9FAFB'}}>
        <div id="modal-root"></div>
        <div id="page-wrapper">
          <LoadingScreen />
          <Suspense fallback={null}>{children}</Suspense>
        </div>
        <Toaster />
      </body>
    </html>
  );
}