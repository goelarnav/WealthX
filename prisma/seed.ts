import "dotenv/config";
import { prisma } from "../lib/db/prisma";
import { importRecommendations, type CreateRecommendationInput } from "../lib/recommendations/repository";

// Demo seed data standing in for the WhatsApp-group spreadsheet. A few
// rows (Yatharth, Oswal Pumps, Shivalik Bimetal) match the figures given
// verbatim; the rest are illustrative so every filter/status combination
// has something to show. Swap this out (or feed a real export through
// importRecommendations) once the real sheet is wired up.
const seedRecommendations: CreateRecommendationInput[] = [
  {
    companyName: "Yatharth Hospitals & Trauma Care",
    nseCode: "YATHARTH",
    purchasePrice: 857,
    currentPrice: 970,
    dayChangePercent: null,
    purchaseDate: new Date("2026-06-24"),
    status: "OPEN",
  },
  {
    companyName: "Oswal Pumps",
    nseCode: "OSWALPUMPS",
    purchasePrice: 438,
    currentPrice: 340,
    dayChangePercent: null,
    purchaseDate: new Date("2026-06-24"),
    status: "CLOSED",
    sellDate: new Date("2026-07-23"),
    sellPrice: 340,
  },
  {
    companyName: "Shivalik Bimetal Controls",
    nseCode: "SBCL",
    purchasePrice: 747,
    currentPrice: 921,
    dayChangePercent: null,
    purchaseDate: new Date("2026-07-10"),
    status: "CLOSED",
    sellDate: new Date("2026-08-07"),
    sellPrice: 921,
  },
  {
    companyName: "Tata Elxsi",
    nseCode: "TATAELXSI",
    purchasePrice: 6800,
    currentPrice: 7150,
    dayChangePercent: 0.8,
    purchaseDate: new Date("2026-07-01"),
    status: "OPEN",
  },
  {
    companyName: "KPI Green Energy",
    nseCode: "KPIGREEN",
    purchasePrice: 620,
    currentPrice: 705,
    dayChangePercent: 1.2,
    purchaseDate: new Date("2026-07-15"),
    status: "OPEN",
  },
  {
    companyName: "Eternal (Zomato)",
    nseCode: "ETERNAL",
    purchasePrice: 260,
    currentPrice: 245,
    dayChangePercent: -0.5,
    purchaseDate: new Date("2026-06-05"),
    status: "OPEN",
  },
  {
    companyName: "Suzlon Energy",
    nseCode: "SUZLON",
    purchasePrice: 62,
    currentPrice: 78,
    dayChangePercent: 2.1,
    purchaseDate: new Date("2026-05-20"),
    status: "OPEN",
  },
  {
    companyName: "Angel One",
    nseCode: "ANGELONE",
    purchasePrice: 2650,
    currentPrice: 2410,
    dayChangePercent: -1.4,
    purchaseDate: new Date("2026-06-12"),
    status: "OPEN",
  },
  {
    companyName: "Mazagon Dock Shipbuilders",
    nseCode: "MAZDOCK",
    purchasePrice: 4200,
    currentPrice: 5100,
    dayChangePercent: null,
    purchaseDate: new Date("2026-05-02"),
    status: "OPEN",
  },
  {
    companyName: "Indian Railway Finance Corporation",
    nseCode: "IRFC",
    purchasePrice: 145,
    currentPrice: 158,
    dayChangePercent: 0.4,
    purchaseDate: new Date("2026-08-01"),
    status: "OPEN",
  },
  {
    companyName: "Route Mobile",
    nseCode: "ROUTE",
    purchasePrice: 1450,
    currentPrice: 1290,
    dayChangePercent: null,
    purchaseDate: new Date("2026-04-18"),
    status: "CLOSED",
    sellDate: new Date("2026-06-01"),
    sellPrice: 1290,
  },
  {
    companyName: "Central Depository Services",
    nseCode: "CDSL",
    purchasePrice: 1180,
    currentPrice: 1450,
    dayChangePercent: null,
    purchaseDate: new Date("2026-03-10"),
    status: "CLOSED",
    sellDate: new Date("2026-04-25"),
    sellPrice: 1450,
  },
  {
    companyName: "One97 Communications (Paytm)",
    nseCode: "PAYTM",
    purchasePrice: 720,
    currentPrice: 610,
    dayChangePercent: null,
    purchaseDate: new Date("2026-02-14"),
    status: "CLOSED",
    sellDate: new Date("2026-03-20"),
    sellPrice: 610,
  },
  {
    companyName: "Craftsman Automation",
    nseCode: "CRAFTSMAN",
    purchasePrice: 4500,
    currentPrice: 5200,
    dayChangePercent: null,
    purchaseDate: new Date("2026-05-25"),
    status: "CLOSED",
    sellDate: new Date("2026-07-02"),
    sellPrice: 5200,
  },
  {
    companyName: "Jyothy Labs",
    nseCode: "JYOTHYLAB",
    purchasePrice: 410,
    currentPrice: 452,
    dayChangePercent: 0.6,
    purchaseDate: new Date("2026-08-10"),
    status: "OPEN",
  },
  {
    companyName: "Aether Industries",
    nseCode: "AETHER",
    purchasePrice: 980,
    currentPrice: 890,
    dayChangePercent: -0.9,
    purchaseDate: new Date("2026-07-28"),
    status: "OPEN",
  },
];

async function main() {
  await prisma.stockRecommendation.deleteMany();
  await importRecommendations(seedRecommendations);
  console.log(`Seeded ${seedRecommendations.length} recommendations.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
