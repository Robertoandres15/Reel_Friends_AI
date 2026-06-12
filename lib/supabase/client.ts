import { createBrowserClient } from "@supabase/ssr"
import { createClient as createNativeSupabaseClient } from "@supabase/supabase-js"
import { Capacitor } from "@capacitor/core"

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) {
    return client
  }

  if (Capacitor.isNativePlatform()) {
    // The native WebView runs on capacitor://localhost where document.cookie
    // is unreliable, so the cookie-backed @supabase/ssr client loses the
    // session. Store it in localStorage instead; the web build keeps cookies
    // for SSR.
    client = createNativeSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: window.localStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      },
    ) as ReturnType<typeof createBrowserClient>
  } else {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  return client
}

export function clearSupabaseSession() {
  // Clear all Supabase cookies
  const cookies = document.cookie.split(";")
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=")
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
    if (name.startsWith("sb-") || name.includes("supabase")) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
    }
  }

  // Clear all localStorage items
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.startsWith("sb-") || key.includes("supabase") || key.includes("reel-friends"))) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key))

  // Clear sessionStorage
  const sessionKeysToRemove: string[] = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key && (key.startsWith("sb-") || key.includes("supabase") || key.includes("reel-friends"))) {
      sessionKeysToRemove.push(key)
    }
  }
  sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key))

  console.log("[v0] Cleared all Supabase session data and app cache")

  client = null
}
