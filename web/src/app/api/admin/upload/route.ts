import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { randomBytes } from 'node:crypto';
import { currentUser } from '@/lib/auth';

export const runtime = 'nodejs';

// Images for Journal articles, stored in Vercel Blob (the project's Blob store sets
// BLOB_READ_WRITE_TOKEN). The editor resizes images to 2000px before sending, so files stay well
// under the 4.5 MB request limit of a Vercel function.
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX = 4 * 1024 * 1024;

export async function POST(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: 'Sign in again.' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Image storage is not connected. Add a Vercel Blob store to the project.' }, { status: 503 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No image received.' }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: 'Use a JPEG, PNG or WebP image.' }, { status: 415 });
  if (file.size > MAX) return NextResponse.json({ error: 'That image is too large (4 MB at most).' }, { status: 413 });

  const name = `journal/${new Date().toISOString().slice(0, 10)}-${randomBytes(6).toString('hex')}.${ext}`;
  const blob = await put(name, file, { access: 'public', contentType: file.type, addRandomSuffix: false });
  return NextResponse.json({ url: blob.url });
}
