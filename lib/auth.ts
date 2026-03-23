import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// ─── Secrets (loaded at call time so Edge runtime can read them) ─────────────

function adminSecret() {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error("ADMIN_JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

function uploadSecret() {
  const s = process.env.UPLOAD_JWT_SECRET;
  if (!s) throw new Error("UPLOAD_JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

// ─── Admin session ────────────────────────────────────────────────────────────

export async function signAdminSession(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("4h")
    .sign(adminSecret());
}

export async function verifyAdminSession(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, adminSecret());
    return payload;
  } catch {
    return null;
  }
}

// ─── Upload session ───────────────────────────────────────────────────────────

export async function signUploadSession(): Promise<string> {
  return new SignJWT({ role: "uploader" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("90d")
    .sign(uploadSecret());
}

export async function verifyUploadSession(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, uploadSecret());
    return payload;
  } catch {
    return null;
  }
}
