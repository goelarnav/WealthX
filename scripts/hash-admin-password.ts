import bcrypt from "bcryptjs";

// Prints a bcrypt hash to paste into ADMIN_PASSWORD_HASH in .env.
// Usage: npm run admin:hash-password -- "your-new-password"
async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error('Usage: npm run admin:hash-password -- "your-new-password"');
    process.exitCode = 1;
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  // Next's env loader interpolates bare "$name" as a variable reference —
  // escape every "$" as "\$" so the hash survives .env loading intact.
  const escaped = hash.replace(/\$/g, "\\$");
  console.log(`ADMIN_PASSWORD_HASH="${escaped}"`);
}

main();
