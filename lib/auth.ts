import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "barber"
}

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("user")

  if (!userCookie) {
    return null
  }

  try {
    return JSON.parse(userCookie.value)
  } catch {
    return null
  }
}

export async function requireAuth(role?: "admin" | "barber") {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  if (role && user.role !== role) {
    redirect("/unauthorized")
  }

  return user
}

export async function requireAdmin() {
  return requireAuth("admin")
}

export async function requireBarber() {
  return requireAuth("barber")
}

export async function getUserFromCookie(): Promise<User | null> {
  return getUser()
}
