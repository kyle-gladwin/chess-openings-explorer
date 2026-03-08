export type Color = "white" | "black" | "both";
export type Style = "classical" | "modern" | "hypermodern";
export type Character =
  | "solid"
  | "positional"
  | "aggressive"
  | "tactical"
  | "dynamic";
export type Complexity = "beginner" | "intermediate" | "advanced";

export interface OpeningTag {
  color: Color;
  style: Style;
  character: Character;
  complexity: Complexity;
  family: string;
  ideas?: string[];
}

export interface Opening {
  id: number;
  eco: string;
  name: string;
  pgn: string;
  // enriched from tags
  color: Color;
  style: Style;
  character: Character;
  complexity: Complexity;
  family: string;
  ideas: string[];
}
