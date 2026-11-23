import { getSupabase, isDemo } from './supabase';
function resize(file: File, max: number): Promise<Blob> {
  return new Promise((res, rej) => {
    const img = new Image(); const u = URL.createObjectURL(file);
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = img.width * r; c.height = img.height * r;
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      c.toBlob((b) => (b ? res(b) : rej(new Error('Gagal memproses gambar'))), 'image/jpeg', 0.85);
    };
    img.onerror = () => rej(new Error('File bukan gambar yang valid'));
    img.src = u;
  });
}
const toDataUrl = (b: Blob) => new Promise<string>((r) => { const f = new FileReader(); f.onload = () => r(f.result as string); f.readAsDataURL(b); });
export async function uploadAvatar(userId: string, file: File) {
  if (isDemo) return toDataUrl(await resize(file, 256));
  const blob = await resize(file, 512);
  const path = `${userId}/avatar.jpg`;
  const sb = getSupabase();
  const { error } = await sb.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
  if (error) throw new Error(error.message);
  return sb.storage.from('avatars').getPublicUrl(path).data.publicUrl + '?t=' + Date.now();
}
