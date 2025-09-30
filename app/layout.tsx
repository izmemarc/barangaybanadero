import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { Montserrat } from "next/font/google";
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
      </head>
      <body className={`font-sans ${inter.variable} ${playfair.variable} ${montserrat.variable}`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Apply scaling after React hydration to prevent mismatch
              (function() {
                function waitForHydration() {
                  // Wait for React to hydrate by checking for React-specific attributes
                  const startTime = Date.now();
                  const maxWait = 3000; // 3 seconds max wait
                  
                  function checkHydration() {
                    // Check if React has hydrated by looking for React-specific attributes
                    const hasReactHydrated = document.body && (
                      document.body.getAttribute('data-reactroot') !== null ||
                      document.querySelector('[data-reactroot]') !== null ||
                      window.React !== undefined ||
                      document.querySelector('[data-nextjs-scroll-focus-boundary]') !== null
                    );
                    
                    if (hasReactHydrated || (Date.now() - startTime) > maxWait) {
                      initScaling();
                    } else {
                      setTimeout(checkHydration, 50);
                    }
                  }
                  
                  // Start checking after a short delay to let React initialize
                  setTimeout(checkHydration, 100);
                }
                
                function initScaling() {
                  // Piecewise scaling function
                  function getScale(h) {
                    if (h >= 735) {
                      // Segment 1: 1023px -> 735px maps 1.00 -> 0.75
                      const m1 = 0.000880;  // recomputed slope
                      const b1 = 0.11; 
                      return m1 * h + b1;
                    } else {
                      // Segment 2: 735px -> 486px maps 0.75 -> 0.62
                      const m2 = 0.000522;  // slope
                      const b2 = 0.306;     // intercept
                      return m2 * h + b2;
                    }
                  }

                  function scalePage() {
                    const h = window.innerHeight;
                    const w = window.innerWidth;
                    const scale = getScale(h);

                    // Apply scale transform
                    document.body.style.transform = 'scale(' + scale + ')';
                    document.body.style.transformOrigin = 'top left';
                    // Compensate for scaling to prevent whitespace
                    document.body.style.width = (100 / scale) + '%';
                    document.body.style.height = (100 / scale) + '%';
                  }

                  scalePage();
                  window.addEventListener('resize', scalePage);
                }
                
                // Start the process when DOM is ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', waitForHydration);
                } else {
                  waitForHydration();
                }
              })();
            `,
          }}
        />
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  );
}