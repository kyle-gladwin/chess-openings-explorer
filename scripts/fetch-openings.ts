import * as fs from "fs";
import * as path from "path";
import * as https from "https";

const BASE_URL =
  "https://raw.githubusercontent.com/lichess-org/chess-openings/master/";
const VOLUMES = ["a", "b", "c", "d", "e"];

function fetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

function parseTsv(tsv: string): {
  eco: string;
  name: string;
  pgn: string;
}[] {
  const lines = tsv.trim().split("\n");
  const headers = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const cols = line.split("\t");
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h.trim()] = (cols[i] || "").trim()));
    return {
      eco: obj["eco"] || "",
      name: obj["name"] || "",
      pgn: obj["pgn"] || "",
    };
  });
}

async function main() {
  const all: { eco: string; name: string; pgn: string }[] = [];

  for (const vol of VOLUMES) {
    const url = `${BASE_URL}${vol}.tsv`;
    console.log(`Fetching ${url}...`);
    const text = await fetchText(url);
    const entries = parseTsv(text);
    console.log(`  → ${entries.length} openings`);
    all.push(...entries);
  }

  console.log(`Total: ${all.length} openings`);

  const outputPath = path.join(process.cwd(), "data/openings.json");
  fs.writeFileSync(outputPath, JSON.stringify(all, null, 2), "utf8");
  console.log(`Written to ${outputPath}`);
}

main().catch(console.error);
