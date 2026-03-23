#!/usr/bin/env node
/**
 * Trash Pandas — Admin setup script
 * Run once: node scripts/setup-admin.mjs
 *
 * Generates:
 *   - bcrypt hash for your admin password
 *   - TOTP secret compatible with Duo Mobile / Google Authenticator / Authy
 *   - Random JWT secrets
 */

import { createInterface } from "readline";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verify as totpVerify } from "otplib";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

console.log("\n🦝  Trash Pandas — Admin Setup\n");

// ── Password ──────────────────────────────────────────────────────────────────
const password = await ask("Choose an admin password: ");
if (password.length < 12) {
  console.error("❌  Password must be at least 12 characters.");
  process.exit(1);
}
const hash = await bcrypt.hash(password, 12);
console.log("\n✅  Password hashed (bcrypt, 12 rounds)\n");

// ── TOTP secret ───────────────────────────────────────────────────────────────
const totpSecret = generateSecret();
const otpauthUrl = generateURI("admin", totpSecret, { issuer: "TrashPandas14U" });

console.log("📱  Scan this URL in your authenticator app:");
console.log(`\n    ${otpauthUrl}\n`);
console.log("    Or add manually:");
console.log(`    Account: admin@TrashPandas14U`);
console.log(`    Secret:  ${totpSecret}`);
console.log(`    Type:    Time-based (TOTP)\n`);

// ── Verify TOTP was set up correctly ─────────────────────────────────────────
const testCode = await ask("Enter the 6-digit code from your app to verify: ");
const valid = await totpVerify({ token: testCode.trim(), secret: totpSecret });
if (!valid) {
  console.error("\n❌  Code did not match. Re-run the script and try again.");
  rl.close();
  process.exit(1);
}
console.log("\n✅  TOTP verified!\n");

// ── JWT secrets ───────────────────────────────────────────────────────────────
const adminJwtSecret = randomBytes(32).toString("hex");
const uploadJwtSecret = randomBytes(32).toString("hex");

// ── Team upload code ──────────────────────────────────────────────────────────
const teamCode = await ask("Choose a team upload code (share via GameChanger, e.g. TrashPandas2025): ");
if (teamCode.length < 6) {
  console.error("❌  Team code must be at least 6 characters.");
  process.exit(1);
}

rl.close();

// ── Output ────────────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════════════");
console.log("  Add these to your .env.local AND Vercel environment vars");
console.log("══════════════════════════════════════════════════════════\n");
console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
console.log(`ADMIN_TOTP_SECRET="${totpSecret}"`);
console.log(`ADMIN_JWT_SECRET="${adminJwtSecret}"`);
console.log(`UPLOAD_JWT_SECRET="${uploadJwtSecret}"`);
console.log(`TEAM_UPLOAD_CODE="${teamCode}"`);
console.log("\n══════════════════════════════════════════════════════════");
console.log("  ⚠️  Save these securely. The TOTP secret is shown once.");
console.log("══════════════════════════════════════════════════════════\n");
