import { readFileSync } from "fs";
import { resolve } from "path";

const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
const vars = {};

for (const line of raw.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let val = trimmed.slice(eq + 1).trim();
  // Strip surrounding single or double quotes
  if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
    val = val.slice(1, -1);
  }
  vars[key] = val;
}

const hash = vars["ADMIN_PASSWORD_HASH"] ?? "";
console.log("HASH len:   ", hash.length || "MISSING");
console.log("HASH starts:", hash.substring(0, 5) || "MISSING");
console.log("TOTP set:   ", !!vars["ADMIN_TOTP_SECRET"]);
console.log("JWT set:    ", !!vars["ADMIN_JWT_SECRET"]);
console.log("UPLOAD set: ", !!vars["UPLOAD_JWT_SECRET"]);
console.log("CODE set:   ", !!vars["TEAM_UPLOAD_CODE"]);
