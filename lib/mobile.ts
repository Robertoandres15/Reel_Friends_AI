import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { App } from "@capacitor/app";
import { Keyboard } from "@capacitor/keyboard";

export const isMobile = () => Capacitor.isNativePlatform();

type ListenerHandle = { remove: () => Promise<void> };

let mobileFeaturesInitialized = false;
let listenerHandles: ListenerHandle[] = [];
let focusHandler: ((event: FocusEvent) => void) | null = null;

let lastFocusedElement: HTMLElement | null = null;

const isFormField = (element: HTMLElement | null): element is HTMLElement => {
  if (!element) return false;

  return (
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "SELECT"
  );
};

const scrollFieldIntoViewIfNeeded = (element: HTMLElement) => {
  // With Capacitor keyboard resize: "native", iOS handles most scrolling.
  // We only nudge if the element is truly off-screen (e.g. clipped at top).
  const rect = element.getBoundingClientRect();

  if (rect.top < 0) {
    window.scrollBy({ top: rect.top - 10, behavior: "smooth" });
  }
};

export const initializeMobileFeatures = async () => {
  if (!isMobile() || mobileFeaturesInitialized) return;

  mobileFeaturesInitialized = true;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#1e293b" });

    const appStateListener = await App.addListener(
      "appStateChange",
      ({ isActive }) => {
        console.log("[mobile] App state changed. Active:", isActive);
      },
    );
    listenerHandles.push(appStateListener);

    const keyboardShowListener = await Keyboard.addListener(
      "keyboardWillShow",
      () => {
        document.body.classList.add("keyboard-open");
      },
    );
    listenerHandles.push(keyboardShowListener);

    const keyboardHideListener = await Keyboard.addListener(
      "keyboardWillHide",
      () => {
        document.body.classList.remove("keyboard-open");
        lastFocusedElement = null;
      },
    );
    listenerHandles.push(keyboardHideListener);

    if (!focusHandler) {
      focusHandler = (event: FocusEvent) => {
        const target = event.target as HTMLElement;

        if (!isFormField(target)) return;

        if (lastFocusedElement === target) return;
        lastFocusedElement = target;

        if (document.body.classList.contains("keyboard-open")) {
          setTimeout(() => {
            scrollFieldIntoViewIfNeeded(target);
          }, 50);
        }
      };

      document.addEventListener("focus", focusHandler, true);
    }
  } catch (error) {
    console.error("[mobile] Error initializing mobile features:", error);
    mobileFeaturesInitialized = false;

    await Promise.allSettled(
      listenerHandles.map((listener) => listener.remove()),
    );
    listenerHandles = [];

    if (focusHandler) {
      document.removeEventListener("focus", focusHandler, true);
      focusHandler = null;
    }
  }
};

export const triggerHaptic = async (
  style: ImpactStyle = ImpactStyle.Medium,
) => {
  if (!isMobile()) return;

  try {
    await Haptics.impact({ style });
  } catch (error) {
    console.error("[mobile] Error triggering haptic:", error);
  }
};

export const setStatusBarStyle = async (isDark: boolean) => {
  if (!isMobile()) return;

  try {
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light,
    });
  } catch (error) {
    console.error("[mobile] Error setting status bar style:", error);
  }
};

export const hideKeyboard = async () => {
  if (!isMobile()) return;

  try {
    await Keyboard.hide();
  } catch (error) {
    console.error("[mobile] Error hiding keyboard:", error);
  }
};
