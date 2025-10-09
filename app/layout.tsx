import React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingScreen } from "@/components/loading-screen";
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
      <body className="font-sans bg-white" style={fontVariables}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Wait for React hydration before applying scaling
              (function() {
                let isHydrated = false
                let checkCount = 0
                const maxChecks = 200 // 10 seconds max (50ms intervals)
                
                function checkHydration() {
                  checkCount++
                  
                  // Check for multiple hydration indicators
                  const hasReactHydrated = (
                    window.React !== undefined ||
                    document.querySelector('[data-nextjs-scroll-focus-boundary]') !== null ||
                    document.querySelector('[data-nextjs-router]') !== null ||
                    document.body?.getAttribute('data-reactroot') !== null ||
                    document.querySelector('[data-reactroot]') !== null ||
                    // Check if React components are actually rendered
                    document.querySelector('header') !== null ||
                    document.querySelector('main') !== null
                  )
                  
                  if (hasReactHydrated) {
                    isHydrated = true
                    // Wait a bit more to ensure hydration is complete
                    setTimeout(initScaling, 100)
                    return
                  }
                  
                  // Continue checking if not hydrated and under limit
                  if (!isHydrated && checkCount < maxChecks) {
                    setTimeout(checkHydration, 50)
                  } else if (!isHydrated) {
                    // Fallback: apply scaling anyway
                    initScaling()
                  }
                }
                
               function initScaling() {
                 // Wait a bit more to ensure hydration is complete
                 setTimeout(() => {
                   // Piecewise scaling function
                   function getScale(h) {
                     if (h >= 735) {
                       return 0.000880 * h + 0.11;
                     } else {
                       return 0.000522 * h + 0.306;
                     }
                   }

                    function scalePage() {
                    const h = window.innerHeight;
                    const scale = getScale(h);

                    // Use requestAnimationFrame to ensure DOM is ready
                    requestAnimationFrame(() => {
                     // Scale only the main content, not the footer
                     const main = document.querySelector('main');
                     const footer = document.querySelector('footer');
                     
                     if (main && footer) {
                       // Get the natural content height before any modifications
                       const naturalHeight = main.scrollHeight;
                       
                       // Apply scaling and width
                       main.style.transform = 'scale(' + scale + ')';
                       main.style.transformOrigin = 'top left';
                       main.style.width = (100 / scale) + '%';
                       
                       // Calculate the scaled height
                       const scaledHeight = naturalHeight * scale;
                       
                       // Set the height to the scaled value
                       main.style.height = scaledHeight + 'px';
                     }
                       
                       document.body.style.overflowX = 'hidden';
                       document.body.style.overflowY = 'auto';
                       document.documentElement.style.overflowX = 'hidden';
                       document.documentElement.style.overflowY = 'auto';
                      });
                    }

                    scalePage();
                    window.addEventListener('resize', scalePage);
                 }, 300);
               }
               
               // Start checking after React has had time to initialize
               setTimeout(checkHydration, 200)
               
              })();
            `,
          }}
        />
        <LoadingScreen />
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  );
}