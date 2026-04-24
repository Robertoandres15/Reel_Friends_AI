"use client";

import type React from "react";
import { Analytics } from "@vercel/analytics/next";
import { Suspense, useEffect } from "react";
import { MobileInitializer } from "@/components/mobile-initializer";
import { initializeCapacitor } from "@/lib/capacitor";
import { SupabaseAuthHandler } from "@/components/supabase-auth-handler";
import { useSafeAreaInsets } from "@/hooks/use-safe-area-insets";
import { PageLoader } from "@/components/page-loader";

function CapacitorInitializer() {
  useEffect(() => {
    initializeCapacitor();
  }, []);

  return null;
}

function SafeAreaInitializer() {
  useSafeAreaInsets();

  return null;
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <MobileInitializer />
      <CapacitorInitializer />
      <SafeAreaInitializer />
      <SupabaseAuthHandler />
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
      <Analytics />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `,
        }}
      />
    </>
  );
}
