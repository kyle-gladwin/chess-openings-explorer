import type { Opening } from "./types";
import { getTagsForEco } from "./tags";
import rawData from "../data/openings.json";

const raw = rawData as {
  eco: string;
  name: string;
  pgn: string;
}[];

// Enrich every entry once at module load (server-side only)
let _cache: Opening[] | null = null;

export function getAllOpenings(): Opening[] {
  if (_cache) return _cache;

  _cache = raw.map((entry, index) => {
    const tags = getTagsForEco(entry.eco);
    return {
      id: index,
      ...entry,
      ...tags,
      ideas: tags.ideas ?? [],
    };
  });

  return _cache;
}

export function getOpeningById(id: number): Opening | undefined {
  return getAllOpenings()[id];
}

export function getVariations(opening: Opening): Opening[] {
  const all = getAllOpenings();
  return all.filter((o) => o.family === opening.family && o.id !== opening.id);
}

/** Returns true if this opening is a base opening (shown in the browse list) */
export function isBaseOpening(opening: Opening): boolean {
  return !opening.name.includes(",");
}

/** Returns the most popular representative opening for each family */
export function getFirstPerFamily(): Opening[] {
  // Sort by popularity first so each family's representative is its most popular entry
  const sorted = [...getAllOpenings()].sort(
    (a, b) => ecoPopularityRank(a.eco) - ecoPopularityRank(b.eco)
  );
  const seen = new Set<string>();
  return sorted.filter((o) => {
    if (seen.has(o.family)) return false;
    seen.add(o.family);
    return true;
  });
}

export function getFirstMove(pgn: string): string {
  const match = pgn.match(/1\.\s*([^\s]+)/);
  return match ? `1. ${match[1]}` : "";
}

/**
 * Popularity rank based on ECO range — lower = more popular.
 * Reflects real-world game frequency at all levels.
 */
export function ecoPopularityRank(eco: string): number {
  const letter = eco[0];
  const num = parseInt(eco.slice(1), 10);

  if (letter === "B") {
    if (num >= 20) return 1;  // Sicilian Defence
    if (num >= 10) return 8;  // Caro-Kann
    if (num >= 6)  return 12; // Pirc / Modern
    return 14;                // Other semi-open
  }
  if (letter === "C") {
    if (num >= 60) return 2;  // Spanish / Ruy López
    if (num >= 50) return 3;  // Italian / Two Knights
    if (num >= 30) return 9;  // King's Gambit
    if (num >= 20) return 10; // Open games misc
    return 4;                 // French Defence
  }
  if (letter === "D") {
    if (num >= 30 && num < 70) return 5; // QGD / Semi-Slav / Slav
    if (num >= 20) return 11;            // QGA
    if (num >= 70) return 13;            // Grünfeld
    return 16;                           // d4 misc
  }
  if (letter === "E") {
    if (num >= 20 && num < 60) return 6;  // Nimzo / QID / Bogo
    if (num >= 60) return 7;              // KID / Grünfeld E
    if (num >= 0)  return 15;             // Catalan / misc
  }
  if (letter === "A") {
    if (num >= 10 && num < 40) return 17; // English
    if (num >= 80) return 18;             // Dutch
    if (num >= 40 && num < 80) return 19; // Benoni / Benko
    return 20;                            // Irregular / flank
  }
  return 20;
}
