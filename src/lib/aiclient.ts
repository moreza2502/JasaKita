import { insert } from './db';
export async function guard(kind: 'service' | 'request', title: string, description: string, userId: string) {
  let verdict = { ok: true, reason: '' };
  try {
    const r = await fetch('/api/ai/guard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, title, description }) });
    verdict = await r.json();
  } catch { /* gagal jaringan: biarkan lolos, tetap tercatat */ }
  try { await insert('mod_logs', { user_id: userId, kind, title, verdict: verdict.ok ? 'APPROVED' : 'REJECTED', reason: verdict.reason || '' }); } catch {}
  return verdict;
}
