import { killServer } from "@prisma/dev/internal/state";

async function main() {
  await killServer(
    process.argv[2] ?? "default",
    !!process.argv.find((a) => a == "--debug"),
  );
}

main();