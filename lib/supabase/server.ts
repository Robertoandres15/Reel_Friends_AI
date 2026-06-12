import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 *
 * Supports two auth modes:
 *  - Web (browser/SSR): the Supabase session lives in cookies.
 *  - Native app (Capacitor): there are no shared cookies, so the client sends
 *    its access token as an `Authorization: Bearer <jwt>` header. When present
 *    we configure the client with that token so `auth.getUser()` and RLS work.
 */
export async function createClient() {
  const cookieStore = await cookies()

  let authHeader: string | null = null
  try {
    authHeader = (await headers()).get("authorization")
  } catch {
    authHeader = null
  }

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    ...(authHeader ? { global: { headers: { Authorization: authHeader } } } : {}),
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
