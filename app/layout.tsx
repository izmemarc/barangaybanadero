import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Banadero, Legazpi City - Official Website",
  description: "Official website of Banadero, Legazpi City - Serving our community with excellence",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} ${playfair.variable} ${montserrat.variable}`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                // Piecewise scaling function
                function getScale(h) {
                  if (h >= 735) {
                    // Segment 1: 1023px -> 735px maps 1.00 -> 0.75
                    const m1 = 0.000868;  // slope
                    const b1 = 0.1012;    // intercept
                    return m1 * h + b1;
                  } else {
                    // Segment 2: 735px -> 486px maps 0.75 -> 0.62
                    const m2 = 0.000522;  // slope
                    const b2 = 0.366;     // intercept
                    return m2 * h + b2;
                  }
                }

                function scalePage() {
                  const h = window.innerHeight;
                  const scale = getScale(h);

                  // Apply scale transform
                  document.body.style.transform = 'scale(' + scale + ')';
                  document.body.style.transformOrigin = 'top left';
                  document.body.style.width = (100 / scale) + '%';
                }

                scalePage();
                window.addEventListener('resize', scalePage);
              });
            `,
          }}
        />
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  );
}