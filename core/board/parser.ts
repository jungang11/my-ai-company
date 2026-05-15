import { readFile } from 'node:fs/promises';
import type { Board, Card, Column } from './types.js';

const HEADING_RE = /^##\s+(.+?)\s*$/;
const CARD_RE = /^-\s+\[([ xX])\]\s+(?:@(\S+)\s+)?(.+?)\s*$/;
const DESC_RE = /^>\s+(.+?)\s*$/;

export function parseBoard(md: string): Board {
  const lines = md.split(/\r?\n/);
  const columns: Column[] = [];
  let current: Column | null = null;
  let lastCard: Card | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      lastCard = null;
      continue;
    }

    const heading = HEADING_RE.exec(line);
    if (heading) {
      current = { name: heading[1], cards: [] };
      columns.push(current);
      lastCard = null;
      continue;
    }

    if (!current) continue;

    const cardMatch = CARD_RE.exec(line);
    if (cardMatch) {
      const [, doneMark, assignee, title] = cardMatch;
      const idx = current.cards.length;
      const card: Card = {
        id: `${current.name}-${idx}`,
        done: doneMark.toLowerCase() === 'x',
        title,
      };
      if (assignee) card.assignee = assignee;
      current.cards.push(card);
      lastCard = card;
      continue;
    }

    const descMatch = DESC_RE.exec(line);
    if (descMatch && lastCard) {
      lastCard.description = lastCard.description
        ? `${lastCard.description}\n${descMatch[1]}`
        : descMatch[1];
    }
  }

  return { columns };
}

export async function parseBoardFile(path: string): Promise<Board> {
  const md = await readFile(path, 'utf-8');
  return parseBoard(md);
}
