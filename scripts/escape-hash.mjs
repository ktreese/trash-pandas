import { readFileSync } from "fs";

const raw = readFileSync(".env.local", "utf8");
for (const line of raw.split("\n")) {
  if (line.startsWith("ADMIN_PASSWORD_HASH")) {
    const eq = line.indexOf("=");
    let val = line.slice(eq + 1).trim();
    // Strip any surrounding quotes
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1);
    }
    const escaped = val.replace(/\$/g, "\\$");
    console.log(`\nReplace your ADMIN_PASSWORD_HASH line with:\n`);
    console.log(`ADMIN_PASSWORD_HASH=${escaped}`);
    console.log(`\n(no quotes, backslash before every $)`);
  }
}
