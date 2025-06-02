import type { Session } from "next-auth"
import { auth } from "../../auth"

export async function getAuthSession(): Promise<Session | null> {
  try {
    return await auth()
  } catch (error) {
    console.error("Auth session error:", error)
    return null
  }
}
