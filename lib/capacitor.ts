import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { App } from "@capacitor/app";
import { Keyboard } from "@capacitor/keyboard";

// In the native app the web bundle is served from capacitor://localhost, so
// relative "/api/..." calls would hit the bundle instead of the backend. Route
// them to the deployed Vercel API. Public Supabase/storage calls use absolute
// URLs already, so they are left untouched.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.reel-friends.ai";

const getAccessToken = async (): Promise<string | null> => {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const {
      data: { session },
    } = await createClient().auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
};

let fetchPatched = false;
const patchNativeFetch = () => {
  if (fetchPatched || typeof window === "undefined") return;
  fetchPatched = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof Request ? input.url : "";
    if (url.startsWith("/")) {
      return (async () => {
        const token = await getAccessToken();
        const headers = new Headers(
          init?.headers ?? (input instanceof Request ? input.headers : undefined),
        );
        if (token && !headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        const absolute = API_BASE_URL + url;
        if (input instanceof Request) {
          return originalFetch(new Request(absolute, input), { ...init, headers });
        }
        return originalFetch(absolute, { ...init, headers });
      })();
    }
    return originalFetch(input, init);
  };
};

export const initializeCapacitor = async () => {
  if (Capacitor.isNativePlatform()) {
    console.log("[v0] Initializing Capacitor for native platform");

    patchNativeFetch();

    try {
      // Configure status bar
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: "#1a1a2e" });

      // Add native app class for styling
      document.body.classList.add("capacitor-native");

      // Handle app state changes
      App.addListener("appStateChange", ({ isActive }) => {
        console.log("[v0] App state changed. Active:", isActive);
      });

      // Hide splash screen after app is ready
      await SplashScreen.hide({ fadeOutDuration: 300 });

      console.log("[v0] Capacitor initialization complete");
    } catch (error) {
      console.error("[v0] Error initializing Capacitor:", error);
      // Still try to hide splash even if other init steps failed
      try {
        await SplashScreen.hide();
      } catch (_) {}
    }
  } else {
    console.log(
      "[v0] Running in web browser, skipping Capacitor initialization",
    );
  }
};

export const isNative = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

// Utility functions for mobile-specific features
export const getDeviceInfo = () => {
  return {
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform(),
    isAndroid: Capacitor.getPlatform() === "android",
    isIOS: Capacitor.getPlatform() === "ios",
  };
};
