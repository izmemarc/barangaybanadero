import React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { AdminProvider } from "@/contexts/admin-context";
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
      <body className="font-sans" style={{...fontVariables, backgroundColor: '#F9FAFB'}}>
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
                   // Piecewise scaling function for 1080p and 1440p
                   function getScale(h) {
                     const w = window.innerWidth;
                     
                     // Disable scaling on mobile to prevent blank space issues
                     if (w < 768) {
                       return 1; // No scaling on mobile
                     }
                     
                     // For 1440p (2560x1440), scale UP to match 1080p with 25% zoom
                     if (w >= 2560 && h >= 1440) {
                       // Calculate what 1080p would use at 1080 height
                       const scale1080p = 0.000880 * 1080 + 0.11; // = 1.0604
                       // Scale UP by 25% (multiply by 1.25) to match 1080p appearance at 1440p
                       return scale1080p * 1.25; // = 1.3255
                     }
                     
                     // Original scaling for 1080p and other resolutions
                     if (h >= 735) {
                       return 0.000880 * h + 0.11;
                     } else {
                       return 0.000522 * h + 0.306;
                     }
                   }

                    function scalePage() {
                    const h = window.innerHeight;
                    const w = window.innerWidth;
                    const scale = getScale(h);
                    
                    console.log('Scaling:', { width: w, height: h, scale: scale });

                    // Use requestAnimationFrame to ensure DOM is ready
                    requestAnimationFrame(() => {
                     // Scale the entire body element
                     const body = document.body;
                     
                     if (body) {
                       // Clear all previous styles
                       body.style.transform = '';
                       body.style.transformOrigin = '';
                       body.style.width = '';
                       body.style.height = '';
                       body.style.minHeight = '';
                       document.documentElement.style.height = '';
                       
                       // Force reflow to get accurate measurements
                       void body.offsetHeight;
                       
                       // Get natural height after clearing styles
                       const naturalHeight = body.scrollHeight;
                       
                       // Apply scaling to entire page
                       body.style.transform = 'scale(' + scale + ')';
                       body.style.transformOrigin = 'top left';
                       body.style.width = (100 / scale) + '%';
                       
                       // Set document height to scaled height to prevent blank space
                       const scaledHeight = naturalHeight * scale;
                       document.documentElement.style.height = scaledHeight + 'px';
                       
                       console.log('Applied scale:', scale, 'naturalHeight:', naturalHeight, 'scaledHeight:', scaledHeight);
                     } else {
                       console.log('Body element not found');
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
        <AdminProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AdminProvider>
      </body>
    </html>
  );
}