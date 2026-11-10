import crypto from 'node:crypto';

export const SESSION_COOKIE_NAME = 'ecoloop_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, keyHex] = storedHash.split(':');
  const keyBuffer = Buffer.from(keyHex, 'hex');
  const derivedBuffer = crypto.scryptSync(password, salt, 64);
  if (keyBuffer.length !== derivedBuffer.length) return false;
  return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function getSessionExpiryIso() {
  return new Date(Date.now() + SESSION_TTL_MS).toISOString();
}

export function parseCookies(cookieHeader = '') {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) cookies[key] = decodeURIComponent(val);
  }
  return cookies;
}

export function buildSessionCookie(token) {
  const maxAgeSec = Math.floor(SESSION_TTL_MS / 1000);
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function sanitizeUser(row) {
  if (!row) return null;
  let acceptedCategories = [];
  let acceptedTags = [];
  try {
    acceptedCategories = JSON.parse(row.accepted_categories || '[]');
  } catch {
    acceptedCategories = [];
  }
  try {
    acceptedTags = JSON.parse(row.accepted_tags || '[]');
  } catch {
    acceptedTags = [];
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    companyName: row.company_name,
    businessType: row.business_type,
    role: row.role,
    location: {
      address: row.address || row.city,
      city: row.city,
      lat: row.lat,
      lng: row.lng
    },
    verificationStatus: row.verification_status || 'verified',
    rating: row.rating ?? 5.0,
    reviewCount: row.review_count ?? 0,
    totalDivertedKg: row.total_diverted_kg ?? 0,
    minCapacityKg: row.min_capacity_kg ?? undefined,
    maxCapacityKg: row.max_capacity_kg ?? undefined,
    acceptedCategories,
    acceptedTags,
    bio: row.bio || '',
    avatar: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };
}

