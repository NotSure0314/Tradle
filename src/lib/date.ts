export function nyDateKey(): string {
  const now = new Date();
  const ny = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  return ny.toISOString().slice(0, 10);
}

export function seededRng(seed: string): () => number {
  let s = hashStr(seed);
  return () => {
    s = (Math.imul(1103515245, s) + 12345) | 0;
    return (s >>> 0) / 0x100000000;
  };
}

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

export function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const copy = arr.slice();
  const result: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length);
    result.push(copy[idx]!);
    copy.splice(idx, 1);
  }
  return result;
}
