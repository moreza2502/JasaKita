import { GoogleGenAI } from '@google/genai';
import { GROUPS } from './constants';
export const hasKey = () => !!process.env.GEMINI_API_KEY;
export const MODEL = 'gemini-2.5-flash';

export async function askJson(system: string, prompt: string): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const r = await ai.models.generateContent({
    model: MODEL, contents: prompt,
    config: { systemInstruction: system, responseMimeType: 'application/json', temperature: 0.4 },
  });
  const t = (r.text || '{}').replace(/```json|```/g, '').trim();
  return JSON.parse(t);
}
export const ALL = GROUPS.flatMap((g) => g.cats.map((c) => ({ cat: c.name, items: c.items })));
export const TAXONOMY_TEXT = ALL.map((c) => `${c.cat}: ${c.items.join('; ')}`).join('\n');
const STOP = new Set(['saya', 'dan', 'yang', 'untuk', 'bisa', 'dengan', 'dari', 'atau', 'ada', 'mau', 'butuh', 'cari', 'jasa', 'tahun', 'pengalaman', 'rumah', 'area', 'kamu', 'anda', 'juga', 'sudah', 'melayani', 'kalau', 'saat', 'lagi', 'tidak', 'akan']);
const SHORT = new Set(['ac', 'pc', 'hp', 'pt', 'cv', 'tv', 'seo', 'wc', 'mc']);
const hit = (w: string, hay: string) => (w.length <= 3 ? new RegExp('\\b' + w + '\\b').test(hay) : hay.includes(w));
// Pencocokan kata kunci sederhana ke daftar layanan (dipakai saat mode simulasi / tanpa Gemini)
export function guessItems(text: string, n = 4) {
  const words = text.toLowerCase().split(/[^a-z0-9]+/).filter((w) => (w.length >= 4 || SHORT.has(w)) && !STOP.has(w));
  const out: { cat: string; item: string; score: number }[] = [];
  for (const c of ALL) for (const item of c.items) {
    const il = item.toLowerCase(), cl = c.cat.toLowerCase();
    const score = words.reduce((a, w) => a + (hit(w, il) ? 3 : 0) + (hit(w, cl) ? 1 : 0), 0);
    if (score > 0) out.push({ cat: c.cat, item, score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, n);
}
