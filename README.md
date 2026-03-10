# Chess Opening Explorer

A fast, modern reference for chess openings — browse 3,641 openings from the Lichess ECO dataset, step through move sequences on an interactive board, and filter by colour, style, complexity, and more.

## Features

- **3,641 openings** from the Lichess ECO dataset (A–E)
- Interactive chessboard with move-by-move playback
- Filter by colour (White/Black), style (classical/modern/hypermodern), character, and complexity
- Win probability data per opening
- Embedded YouTube tutorials per opening
- Variations listed on each opening detail page
- Responsive — works on mobile and desktop

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev)
- [react-chessboard v5](https://github.com/Clariity/react-chessboard)
- [chess.js v1.4](https://github.com/jhlywa/chess.js)
- [Tailwind CSS v4](https://tailwindcss.com)
- TypeScript

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  page.tsx                  # Home — pick White or Black
  openings/
    page.tsx                # Browse/filter all openings
    [id]/page.tsx           # Opening detail (board + stats + videos)
components/                 # UI components (board panels, filter bar, cards…)
lib/
  openings.ts               # Load & query openings data
  tags.ts                   # ECO metadata (style, character, complexity…)
  types.ts                  # TypeScript interfaces
data/
  openings.json             # Full ECO dataset (3,641 entries)
scripts/
  fetch-openings.ts         # Re-fetch/update openings from Lichess
```

## Updating Opening Data

```bash
npx ts-node -e "require('./scripts/fetch-openings.ts')"
```

## Credits

Opening data from [Lichess](https://lichess.org) (open-source, CC0).
Built by [Kyle Gladwin](https://github.com/kyle-gladwin) with Claude.
