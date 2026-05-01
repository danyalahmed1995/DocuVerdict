import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { extractPdfTextFromBuffer } from "../src/lib/pdf";

const samplesDir = join(process.cwd(), "docuverdict_sample_pdfs");
const pdfs = readdirSync(samplesDir).filter((file) => file.endsWith(".pdf"));

async function main() {
  for (const pdf of pdfs) {
    const bytes = readFileSync(join(samplesDir, pdf));
    const text = await extractPdfTextFromBuffer(bytes);

    console.log(`${basename(pdf)}: OK (${text.length} chars)`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "PDF extraction test failed.");
  process.exitCode = 1;
});
