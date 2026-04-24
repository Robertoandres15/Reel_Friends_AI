import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { App } from "@capacitor/app";
import { Keyboard } from "@capacitor/keyboard";

export const initializeCapacitor = async () => {
  if (Capacitor.isNativePlatform()) {
    console.log("[v0] Initializing Capacitor for native platform");

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
