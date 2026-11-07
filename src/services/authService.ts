import { db } from '../database/db'

const enc = new TextEncoder()
const hex = (u: Uint8Array) => Array.from(u, (b) => b.toString(16).padStart(2, '0')).join('')
const unhex = (s: string) => new Uint8Array(s.match(/../g)!.map((h) => parseInt(h, 16)))

async function derive(pw: string, salt: Uint8Array) {
  if (!crypto?.subtle) throw new Error('Login membutuhkan HTTPS atau localhost.')
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 150000, hash: 'SHA-256' }, key, 256)
  return hex(new Uint8Array(bits))
}

/** Akun lokal pertama dibuat saat pertama kali aplikasi dibuka. */
export async function register(name: string, username: string, pw: string) {
  if ((await db.users.count()) > 0) throw new Error('Akun sudah ada. Silakan masuk.')
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return db.users.add({
    name: name.trim(), username: username.trim().toLowerCase(), salt: hex(salt),
    hash: await derive(pw, salt), created_at: new Date().toISOString(),
  })
}

export async function login(username: string, pw: string) {
  const u = await db.users.where('username').equals(username.trim().toLowerCase()).first()
  if (!u || (await derive(pw, unhex(u.salt))) !== u.hash) throw new Error('Nama pengguna atau kata sandi salah.')
  return u.id!
}
