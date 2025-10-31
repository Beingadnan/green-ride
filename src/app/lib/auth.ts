import { cookies } from "next/headers";
import { verifyAuth, JWTPayload } from "./jwt";

export async function getAuthUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get("x-api-key")?.value;
    if (!token) token = cookieStore.get("x-auth-token")?.value;
    if (!token) return null;
    return verifyAuth(token);
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  const user = await getAuthUser();
  return user?.role === "admin";
}

export async function requireAuth(): Promise<JWTPayload> {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin(): Promise<JWTPayload> {
  const user = await requireAuth();
  if (user.role !== "admin") throw new Error("Forbidden - Admin access required");
  return user;
}


