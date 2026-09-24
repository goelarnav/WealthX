import "dotenv/config";
import { prisma } from "../lib/db/prisma";
import { refreshAllPrices } from "../lib/market/refresh-prices";

async function main() {
  const summary = await refreshAllPrices();
  console.log(
    `Refreshed ${summary.updated}/${summary.attempted} prices.` +
      (summary.failed.length ? ` Failed: ${summary.failed.join(", ")}` : ""),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
