import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";

export interface JWTPayload {
  userId: string;
  phoneE164: string; // E.164 format
  role?: string;
}

export function signAuth(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyAuth(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export function extractToken(authHeader: string | null, cookies?: any): string | null {
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  if (cookies && cookies["x-api-key"]) return cookies["x-api-key"];
  if (cookies && cookies["x-auth-token"]) return cookies["x-auth-token"];
  return null;
}

export const signToken = signAuth;
export const verifyToken = verifyAuth;


