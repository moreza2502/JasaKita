import { GoogleGenAI } from '@google/genai';
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
export const KEYWORDS: Record<string, string[]> = {
  'Tukang Bangunan': ['tukang', 'bangunan', 'atap', 'bocor', 'cat', 'keramik', 'renovasi', 'listrik', 'plafon', 'dinding', 'pipa', 'kanopi'],
  'Service AC': ['ac', 'freon', 'pendingin', 'cuci ac', 'servis ac', 'service ac'],
  'Jasa Accounting & Pajak': ['akuntan', 'accounting', 'pajak', 'spt', 'pembukuan', 'laporan keuangan', 'laba rugi', 'audit'],
  'Web & IT Support': ['website', 'web', 'aplikasi', 'it', 'komputer', 'wifi', 'jaringan', 'cctv', 'software', 'landing page', 'toko online'],
  'Freelance Sales Marketing': ['sales', 'marketing', 'instagram', 'iklan', 'ads', 'konten', 'sosial media', 'media sosial', 'telemarketing', 'promosi'],
};
export function guessCategory(text: string) {
  const t = ' ' + text.toLowerCase() + ' ';
  let best = 'Lainnya', score = 0;
  for (const [cat, ws] of Object.entries(KEYWORDS)) {
    const s = ws.filter((w) => t.includes(' ' + w) || t.includes(w + ' ')).length;
    if (s > score) { score = s; best = cat; }
  }
  return best;
}
