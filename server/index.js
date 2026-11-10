import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { initDatabase } from './db.js';
import {
  SESSION_COOKIE_NAME,
  hashPassword,
  verifyPassword,
  generateToken,
  getSessionExpiryIso,
  parseCookies,
  buildSessionCookie,
  clearSessionCookie,
  sanitizeUser
} from './auth.js';
import { getFullListingMetrics, normalizeToKg } from '../src/services/impactCalculator.js';
import { calculateMatchScore } from '../src/services/matchingEngine.js';

const DEMO_USER_IDS = new Set([
  'user_greenfork',
  'user_bioloop',
  'user_apex',
  'user_pacific_polymer',
  'user_valley_farm',
  'user_brewery'
]);

const CITY_COORDINATES = {
  'san francisco, ca': { lat: 37.7749, lng: -122.4194 },
  'oakland, ca': { lat: 37.8044, lng: -122.2711 },
  'berkeley, ca': { lat: 37.8715, lng: -122.273 },
  'brisbane, ca': { lat: 37.6808, lng: -122.3999 },
  'san leandro, ca': { lat: 37.7249, lng: -122.1561 },
  'sonoma, ca': { lat: 38.2919, lng: -122.458 },
  'san jose, ca': { lat: 37.3382, lng: -121.8863 },
  'los angeles, ca': { lat: 34.0522, lng: -118.2437 },
  'new york, ny': { lat: 40.7128, lng: -74.006 },
  'chicago, il': { lat: 41.8781, lng: -87.6298 },
  'austin, tx': { lat: 30.2672, lng: -97.7431 },
  'seattle, wa': { lat: 47.6062, lng: -122.3321 },
  'denver, co': { lat: 39.7392, lng: -104.9903 },
  'boston, ma': { lat: 42.3601, lng: -71.0589 },
  'london, uk': { lat: 51.5072, lng: -0.1276 },
  'toronto, on': { lat: 43.6532, lng: -79.3832 },
  'mumbai, in': { lat: 19.076, lng: 72.8777 },
  'bengaluru, in': { lat: 12.9716, lng: 77.5946 }
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8'
};

function sendJson(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1_048_576) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      raw += chunk.toString('utf8');
    });
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

function resolveCoords(city, lat, lng) {
  if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    return { lat, lng };
  }
  const key = (city || '').trim().toLowerCase();
  return CITY_COORDINATES[key] || { lat: 37.7749, lng: -122.4194 };
}

function mapListingRow(row) {
  let contaminationFlags = [];
  let photos = [];
  let metrics = {};
  try { contaminationFlags = JSON.parse(row.contamination_flags || '[]'); } catch { contaminationFlags = []; }
  try { photos = JSON.parse(row.photos || '[]'); } catch { photos = []; }
  try { metrics = JSON.parse(row.metrics || '{}'); } catch { metrics = {}; }

  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerName: row.owner_company_name || row.owner_name || 'Verified Supplier',
    ownerAvatar: row.owner_avatar || '',
    ownerVerificationStatus: row.owner_verification_status || 'verified',
    title: row.title,
    category: row.category,
    subTag: row.sub_tag,
    quantity: row.quantity,
    unit: row.unit,
    qualityGrade: row.quality_grade,
    purityPercentage: row.purity_percentage,
    contaminationFlags,
    urgencyLevel: row.urgency_level,
    urgencyText: row.urgency_text,
    isRecurring: Boolean(row.is_recurring),
    recurrenceSchedule: row.recurrence_schedule,
    priceType: row.price_type,
    priceValue: row.price_value,
    location: {
      address: row.address || row.city,
      city: row.city,
      lat: row.lat,
      lng: row.lng
    },
    availabilityWindow: row.availability_window,
    photos,
    description: row.description,
    metrics,
    status: row.status,
    createdAt: row.created_at
  };
}

function getAuthenticatedUser(db, req) {
  const cookies = parseCookies(req.headers.cookie);
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const token = bearerToken || cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  const session = db
    .prepare('SELECT token, user_id, expires_at FROM sessions WHERE token = ?')
    .get(token);

  if (!session) return null;
  if (new Date(session.expires_at).getTime() <= Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }

  const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id);
  return userRow ? { token, user: sanitizeUser(userRow) } : null;
}

function createSessionForUser(db, userId) {
  const token = generateToken();
  const now = new Date().toISOString();
  const expiresAt = getSessionExpiryIso();
  db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .run(token, userId, now, expiresAt);
  return token;
}

function getMatchesForUser(db, userId) {
  const rows = db.prepare(`
    SELECT
      m.*,
      s.name AS seller_name,
      s.company_name AS seller_company,
      b.name AS buyer_name,
      b.company_name AS buyer_company
    FROM matches m
    JOIN users s ON s.id = m.seller_id
    JOIN users b ON b.id = m.buyer_id
    WHERE m.seller_id = ? OR m.buyer_id = ?
    ORDER BY m.created_at DESC
  `).all(userId, userId);

  const getMsgs = db.prepare('SELECT * FROM messages WHERE match_id = ? ORDER BY timestamp ASC');

  return rows.map((r) => ({
    id: r.id,
    listingId: r.listing_id,
    listingTitle: r.listing_title,
    listingCategory: r.listing_category,
    listingQuantity: r.listing_quantity,
    sellerId: r.seller_id,
    sellerName: r.seller_name,
    sellerCompany: r.seller_company,
    buyerId: r.buyer_id,
    buyerName: r.buyer_name,
    buyerCompany: r.buyer_company,
    matchScore: r.match_score,
    status: r.status,
    estimatedLogisticsCost: r.estimated_logistics_cost,
    estimatedCarbonSavingsKg: r.estimated_carbon_savings_kg,
    estimatedMethaneSavingsKg: r.estimated_methane_savings_kg,
    pickupSchedule: r.pickup_schedule,
    notes: r.notes,
    createdAt: r.created_at,
    messages: getMsgs.all(r.id).map((msg) => ({
      id: msg.id,
      senderId: msg.sender_id,
      senderName: msg.sender_name,
      text: msg.text,
      timestamp: msg.timestamp
    }))
  }));
}

export function createRequestHandler(db = initDatabase()) {
  const distDir = path.join(process.cwd(), 'dist');

  return async (req, res) => {
    const reqUrl = new URL(req.url || '/', 'http://localhost');
    const pathname = reqUrl.pathname;
    const method = req.method || 'GET';

    try {
      // Health Check
      if (method === 'GET' && pathname === '/api/health') {
        return sendJson(res, 200, { ok: true, database: 'sqlite' });
      }

      // Auth: Me
      if (method === 'GET' && pathname === '/api/auth/me') {
        const auth = getAuthenticatedUser(db, req);
        return sendJson(res, 200, { user: auth ? auth.user : null });
      }

      // Auth: Register
      if (method === 'POST' && pathname === '/api/auth/register') {
        const body = await readJsonBody(req);
        const email = (body.email || '').trim().toLowerCase();
        const password = String(body.password || '');
        const name = (body.name || '').trim();
        const companyName = (body.companyName || '').trim();
        const businessType = (body.businessType || 'Commercial Partner').trim();
        const role = ['seller', 'buyer', 'both'].includes(body.role) ? body.role : 'both';
        const city = (body.city || 'San Francisco, CA').trim();
        const address = (body.address || city).trim();

        if (!email || !email.includes('@') || password.length < 6 || !name || !companyName) {
          return sendJson(res, 400, {
            error: 'Valid email, password (6+ characters), name, and company name are required.'
          });
        }

        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
          return sendJson(res, 409, { error: 'An account with this email already exists.' });
        }

        const id = `user_${crypto.randomUUID().slice(0, 8)}`;
        const coords = resolveCoords(city, body.lat, body.lng);
        const now = new Date().toISOString();
        const acceptedCategories =
          role === 'seller'
            ? []
            : ['Organic/Food waste', 'Industrial/Manufacturing waste', 'Finished compost/fertilizer/biochar output'];

        db.prepare(`
          INSERT INTO users (
            id, email, password_hash, name, company_name, business_type, role,
            city, address, lat, lng, verification_status, rating, review_count,
            total_diverted_kg, accepted_categories, accepted_tags, bio, avatar, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', 5.0, 0, 0, ?, '[]', ?, ?, ?)
        `).run(
          id,
          email,
          hashPassword(password),
          name,
          companyName,
          businessType,
          role,
          city,
          address,
          coords.lat,
          coords.lng,
          JSON.stringify(acceptedCategories),
          body.bio || `${businessType} operating in ${city}`,
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          now
        );

        const token = createSessionForUser(db, id);
        const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        return sendJson(
          res,
          201,
          { user: sanitizeUser(userRow) },
          { 'Set-Cookie': buildSessionCookie(token) }
        );
      }

      // Auth: Login
      if (method === 'POST' && pathname === '/api/auth/login') {
        const body = await readJsonBody(req);
        const email = (body.email || '').trim().toLowerCase();
        const password = String(body.password || '');

        if (!email || !password) {
          return sendJson(res, 400, { error: 'Email and password are required.' });
        }

        const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!userRow || !verifyPassword(password, userRow.password_hash)) {
          return sendJson(res, 401, { error: 'Invalid email or password.' });
        }

        const token = createSessionForUser(db, userRow.id);
        return sendJson(
          res,
          200,
          { user: sanitizeUser(userRow) },
          { 'Set-Cookie': buildSessionCookie(token) }
        );
      }

      // Auth: Demo Account Switch (restricted strictly to seeded demo personas)
      if (method === 'POST' && pathname === '/api/auth/demo-login') {
        const body = await readJsonBody(req);
        const userId = String(body.userId || '');
        if (!DEMO_USER_IDS.has(userId)) {
          return sendJson(res, 403, { error: 'Quick switching is only available for seeded demo accounts.' });
        }
        const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        if (!userRow) {
          return sendJson(res, 404, { error: 'Account not found.' });
        }
        const token = createSessionForUser(db, userRow.id);
        return sendJson(
          res,
          200,
          { user: sanitizeUser(userRow) },
          { 'Set-Cookie': buildSessionCookie(token) }
        );
      }

      // Auth: Logout
      if (method === 'POST' && pathname === '/api/auth/logout') {
        const auth = getAuthenticatedUser(db, req);
        if (auth) {
          db.prepare('DELETE FROM sessions WHERE token = ?').run(auth.token);
        }
        return sendJson(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
      }

      // Users directory (public non-sensitive fields)
      if (method === 'GET' && pathname === '/api/users') {
        const rows = db.prepare('SELECT * FROM users ORDER BY created_at ASC').all();
        return sendJson(res, 200, {
          users: rows.map((r) => ({
            ...sanitizeUser(r),
            isDemo: DEMO_USER_IDS.has(r.id)
          }))
        });
      }

      // Listings: List
      if (method === 'GET' && pathname === '/api/listings') {
        const auth = getAuthenticatedUser(db, req);
        const rows = db.prepare(`
          SELECT
            l.*,
            u.name AS owner_name,
            u.company_name AS owner_company_name,
            u.avatar AS owner_avatar,
            u.verification_status AS owner_verification_status
          FROM listings l
          JOIN users u ON u.id = l.owner_id
          WHERE l.status = 'active'
          ORDER BY l.created_at DESC
        `).all();

        let skippedIds = [];
        if (auth) {
          skippedIds = db
            .prepare('SELECT listing_id FROM skips WHERE user_id = ?')
            .all(auth.user.id)
            .map((r) => r.listing_id);
        }

        return sendJson(res, 200, {
          listings: rows.map(mapListingRow),
          skippedIds
        });
      }

      // Listings: Create
      if (method === 'POST' && pathname === '/api/listings') {
        const auth = getAuthenticatedUser(db, req);
        if (!auth) return sendJson(res, 401, { error: 'Authentication required to create listings.' });

        const body = await readJsonBody(req);
        const title = (body.title || '').trim();
        const category = (body.category || 'Industrial/Manufacturing waste').trim();
        const subTag = (body.subTag || 'Metal Scraps - Aluminum').trim();
        const quantity = Number(body.quantity);
        const unit = (body.unit || 'kg').trim();

        if (!title || Number.isNaN(quantity) || quantity <= 0) {
          return sendJson(res, 400, { error: 'Listing title and positive quantity are required.' });
        }

        const location = {
          city: body.location?.city || auth.user.location.city,
          address: body.location?.address || auth.user.location.address,
          lat: body.location?.lat || auth.user.location.lat,
          lng: body.location?.lng || auth.user.location.lng
        };

        const listingDraft = {
          title,
          category,
          subTag,
          quantity,
          unit,
          qualityGrade: body.qualityGrade || 'Standard Segregated',
          purityPercentage: Number(body.purityPercentage) || 98.0,
          contaminationFlags: Array.isArray(body.contaminationFlags) ? body.contaminationFlags : [],
          urgencyLevel: body.urgencyLevel || 'Flexible',
          urgencyText: body.urgencyText || '',
          isRecurring: Boolean(body.isRecurring),
          recurrenceSchedule: body.recurrenceSchedule || 'One-time lot',
          priceType: body.priceType || 'Free',
          priceValue: body.priceType === 'Free' ? 0 : Number(body.priceValue) || 0,
          location,
          availabilityWindow: body.availabilityWindow || 'Mon–Fri 8:00 AM – 4:00 PM',
          photos: Array.isArray(body.photos) && body.photos.length > 0
            ? body.photos
            : ['https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=600&auto=format&fit=crop&q=80'],
          description: (body.description || '').trim()
        };

        const metrics = getFullListingMetrics(listingDraft, auth.user.location);
        const id = `list_${crypto.randomUUID().slice(0, 8)}`;
        const now = new Date().toISOString();

        db.prepare(`
          INSERT INTO listings (
            id, owner_id, title, category, sub_tag, quantity, unit,
            quality_grade, purity_percentage, contamination_flags,
            urgency_level, urgency_text, is_recurring, recurrence_schedule,
            price_type, price_value, city, address, lat, lng,
            availability_window, photos, description, metrics, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
        `).run(
          id,
          auth.user.id,
          listingDraft.title,
          listingDraft.category,
          listingDraft.subTag,
          listingDraft.quantity,
          listingDraft.unit,
          listingDraft.qualityGrade,
          listingDraft.purityPercentage,
          JSON.stringify(listingDraft.contaminationFlags),
          listingDraft.urgencyLevel,
          listingDraft.urgencyText,
          listingDraft.isRecurring ? 1 : 0,
          listingDraft.recurrenceSchedule,
          listingDraft.priceType,
          listingDraft.priceValue,
          listingDraft.location.city,
          listingDraft.location.address,
          listingDraft.location.lat,
          listingDraft.location.lng,
          listingDraft.availabilityWindow,
          JSON.stringify(listingDraft.photos),
          listingDraft.description,
          JSON.stringify(metrics),
          now
        );

        const created = db.prepare(`
          SELECT
            l.*,
            u.name AS owner_name,
            u.company_name AS owner_company_name,
            u.avatar AS owner_avatar,
            u.verification_status AS owner_verification_status
          FROM listings l
          JOIN users u ON u.id = l.owner_id
          WHERE l.id = ?
        `).get(id);

        return sendJson(res, 201, { listing: mapListingRow(created) });
      }

      // Listings: Delete (owner only)
      const deleteListingMatch = pathname.match(/^\/api\/listings\/([^/]+)$/);
      if (method === 'DELETE' && deleteListingMatch) {
        const auth = getAuthenticatedUser(db, req);
        if (!auth) return sendJson(res, 401, { error: 'Authentication required.' });

        const listingId = decodeURIComponent(deleteListingMatch[1]);
        const existing = db.prepare('SELECT owner_id FROM listings WHERE id = ?').get(listingId);
        if (!existing) return sendJson(res, 404, { error: 'Listing not found.' });
        if (existing.owner_id !== auth.user.id) {
          return sendJson(res, 403, { error: 'You can only delete your own listings.' });
        }

        db.prepare('DELETE FROM listings WHERE id = ?').run(listingId);
        return sendJson(res, 200, { ok: true, id: listingId });
      }

      // Skips: Skip a listing
      const skipListingMatch = pathname.match(/^\/api\/listings\/([^/]+)\/skip$/);
      if (method === 'POST' && skipListingMatch) {
        const auth = getAuthenticatedUser(db, req);
        if (!auth) return sendJson(res, 401, { error: 'Authentication required.' });

        const listingId = decodeURIComponent(skipListingMatch[1]);
        db.prepare(`
          INSERT OR IGNORE INTO skips (user_id, listing_id, created_at)
          VALUES (?, ?, ?)
        `).run(auth.user.id, listingId, new Date().toISOString());

        return sendJson(res, 200, { ok: true });
      }

      // Skips: Reset queue
      if (method === 'DELETE' && pathname === '/api/skips') {
        const auth = getAuthenticatedUser(db, req);
        if (!auth) return sendJson(res, 401, { error: 'Authentication required.' });
        db.prepare('DELETE FROM skips WHERE user_id = ?').run(auth.user.id);
        return sendJson(res, 200, { ok: true });
      }

      // Matches: List
      if (method === 'GET' && pathname === '/api/matches') {
        const auth = getAuthenticatedUser(db, req);
        if (!auth) return sendJson(res, 200, { matches: [] });
        return sendJson(res, 200, { matches: getMatchesForUser(db, auth.user.id) });
      }

      // Matches: Create
      if (method === 'POST' && pathname === '/api/matches') {
        const auth = getAuthenticatedUser(db, req);
        if (!auth) return sendJson(res, 401, { error: 'Authentication required to match.' });

        const body = await readJsonBody(req);
        const listingId = String(body.listingId || '');
        const row = db.prepare(`
          SELECT
            l.*,
            u.name AS owner_name,
            u.company_name AS owner_company_name,
            u.avatar AS owner_avatar,
            u.verification_status AS owner_verification_status
          FROM listings l
          JOIN users u ON u.id = l.owner_id
          WHERE l.id = ?
        `).get(listingId);

        if (!row) return sendJson(res, 404, { error: 'Listing not found.' });
        if (row.owner_id === auth.user.id) {
          return sendJson(res, 400, { error: 'Cannot match with your own listing.' });
        }

        const existingMatch = db
          .prepare('SELECT id FROM matches WHERE listing_id = ? AND buyer_id = ?')
          .get(listingId, auth.user.id);

        if (existingMatch) {
          const matchList = getMatchesForUser(db, auth.user.id);
          return sendJson(res, 200, {
            match: matchList.find((m) => m.id === existingMatch.id)
          });
        }

        const listingObj = mapListingRow(row);
        const metrics = getFullListingMetrics(listingObj, auth.user.location);
        const analysis = calculateMatchScore(listingObj, auth.user);
        const matchId = `match_${crypto.randomUUID().slice(0, 8)}`;
        const now = new Date().toISOString();

        db.exec('BEGIN');
        try {
          db.prepare(`
            INSERT INTO matches (
              id, listing_id, listing_title, listing_category, listing_quantity,
              seller_id, buyer_id, match_score, status,
              estimated_logistics_cost, estimated_carbon_savings_kg, estimated_methane_savings_kg,
              pickup_schedule, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Proposed', ?, ?, ?, 'Pending negotiation', ?, ?)
          `).run(
            matchId,
            listingObj.id,
            listingObj.title,
            listingObj.category,
            `${listingObj.quantity} ${listingObj.unit}`,
            listingObj.ownerId,
            auth.user.id,
            analysis.score,
            metrics.logisticsCost,
            metrics.carbonSavingsKg,
            metrics.methaneAvoidedKg,
            `Matched (${analysis.grade})`,
            now
          );

          db.prepare(`
            INSERT INTO messages (id, match_id, sender_id, sender_name, text, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            `msg_${crypto.randomUUID().slice(0, 8)}`,
            matchId,
            auth.user.id,
            auth.user.name,
            `Hi ${listingObj.ownerName}, we are interested in your "${listingObj.title}" listing (${listingObj.quantity} ${listingObj.unit}). Let's coordinate pickup timing.`,
            now
          );

          db.exec('COMMIT');
        } catch (err) {
          db.exec('ROLLBACK');
          throw err;
        }

        const matchList = getMatchesForUser(db, auth.user.id);
        return sendJson(res, 201, {
          match: matchList.find((m) => m.id === matchId)
        });
      }

      // Matches: Update status / schedule
      const updateMatchRegex = pathname.match(/^\/api\/matches\/([^/]+)$/);
      if (method === 'PATCH' && updateMatchRegex) {
        const auth = getAuthenticatedUser(db, req);
        if (!auth) return sendJson(res, 401, { error: 'Authentication required.' });

        const matchId = decodeURIComponent(updateMatchRegex[1]);
        const existing = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
        if (!existing) return sendJson(res, 404, { error: 'Match not found.' });
        if (existing.seller_id !== auth.user.id && existing.buyer_id !== auth.user.id) {
          return sendJson(res, 403, { error: 'Not authorized for this match.' });
        }

        const body = await readJsonBody(req);
        const allowed = ['Proposed', 'Accepted', 'Scheduled', 'Completed'];
        const nextStatus = allowed.includes(body.status) ? body.status : existing.status;
        const nextSchedule = body.pickupSchedule ? String(body.pickupSchedule).trim() : existing.pickup_schedule;

        db.exec('BEGIN');
        try {
          db.prepare('UPDATE matches SET status = ?, pickup_schedule = ? WHERE id = ?')
            .run(nextStatus, nextSchedule, matchId);

          if (existing.status !== 'Completed' && nextStatus === 'Completed') {
            const listingRow = db.prepare('SELECT quantity, unit FROM listings WHERE id = ?').get(existing.listing_id);
            const kg = listingRow ? normalizeToKg(listingRow.quantity, listingRow.unit) : 0;
            if (kg > 0) {
              db.prepare('UPDATE users SET total_diverted_kg = total_diverted_kg + ? WHERE id IN (?, ?)')
                .run(kg, existing.seller_id, existing.buyer_id);
            }
          }
          db.exec('COMMIT');
        } catch (err) {
          db.exec('ROLLBACK');
          throw err;
        }

        const matchList = getMatchesForUser(db, auth.user.id);
        return sendJson(res, 200, {
          match: matchList.find((m) => m.id === matchId)
        });
      }

      // Matches: Send message
      const sendMsgRegex = pathname.match(/^\/api\/matches\/([^/]+)\/messages$/);
      if (method === 'POST' && sendMsgRegex) {
        const auth = getAuthenticatedUser(db, req);
        if (!auth) return sendJson(res, 401, { error: 'Authentication required.' });

        const matchId = decodeURIComponent(sendMsgRegex[1]);
        const existing = db.prepare('SELECT seller_id, buyer_id FROM matches WHERE id = ?').get(matchId);
        if (!existing) return sendJson(res, 404, { error: 'Match not found.' });
        if (existing.seller_id !== auth.user.id && existing.buyer_id !== auth.user.id) {
          return sendJson(res, 403, { error: 'Not authorized for this match.' });
        }

        const body = await readJsonBody(req);
        const text = (body.text || '').trim();
        if (!text) return sendJson(res, 400, { error: 'Message text cannot be empty.' });

        const msg = {
          id: `msg_${crypto.randomUUID().slice(0, 8)}`,
          matchId,
          senderId: auth.user.id,
          senderName: auth.user.name,
          text,
          timestamp: new Date().toISOString()
        };

        db.prepare(`
          INSERT INTO messages (id, match_id, sender_id, sender_name, text, timestamp)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(msg.id, matchId, msg.senderId, msg.senderName, msg.text, msg.timestamp);

        return sendJson(res, 201, { message: msg });
      }

      // Reviews: List
      if (method === 'GET' && pathname === '/api/reviews') {
        const rows = db.prepare('SELECT * FROM reviews ORDER BY rowid DESC').all();
        return sendJson(
          res,
          200,
          {
            reviews: rows.map((r) => ({
              id: r.id,
              targetUserId: r.target_user_id,
              reviewerName: r.reviewer_name,
              rating: r.rating,
              tag: r.tag,
              comment: r.comment,
              date: r.date
            }))
          }
        );
      }

      // Reviews: Create
      if (method === 'POST' && pathname === '/api/reviews') {
        const auth = getAuthenticatedUser(db, req);
        if (!auth) return sendJson(res, 401, { error: 'Authentication required.' });

        const body = await readJsonBody(req);
        const targetUserId = String(body.targetUserId || '');
        const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
        const tag = (body.tag || 'Verified Partner').trim();
        const comment = (body.comment || '').trim();

        if (!targetUserId || !comment) {
          return sendJson(res, 400, { error: 'Target user and review comment are required.' });
        }

        const id = `rev_${crypto.randomUUID().slice(0, 8)}`;
        const reviewerName = `${auth.user.name} (${auth.user.companyName})`;
        const dateLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        db.exec('BEGIN');
        try {
          db.prepare(`
            INSERT INTO reviews (id, target_user_id, reviewer_id, match_id, reviewer_name, rating, tag, comment, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(id, targetUserId, auth.user.id, body.matchId || null, reviewerName, rating, tag, comment, dateLabel);

          const agg = db
            .prepare('SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE target_user_id = ?')
            .get(targetUserId);

          if (agg && agg.cnt > 0) {
            db.prepare('UPDATE users SET rating = ?, review_count = ? WHERE id = ?')
              .run(Math.round(agg.avg_rating * 100) / 100, agg.cnt, targetUserId);
          }
          db.exec('COMMIT');
        } catch (err) {
          db.exec('ROLLBACK');
          throw err;
        }

        return sendJson(res, 201, {
          review: { id, targetUserId, reviewerName, rating, tag, comment, date: dateLabel }
        });
      }

      // Analytics: Live DB aggregates
      if (method === 'GET' && pathname === '/api/analytics') {
        const auth = getAuthenticatedUser(db, req);
        const allListings = db.prepare('SELECT * FROM listings').all().map(mapListingRow);
        const allMatches = db.prepare('SELECT * FROM matches').all();
        const allUsers = db.prepare('SELECT * FROM users').all();
        const activeUser = auth ? auth.user : null;

        let userCarbonKg = 0;
        let userMethaneKg = 0;
        let userValueDollar = 0;

        const categoryKg = {
          'Organic/Food waste': 0,
          'Industrial/Manufacturing waste': 0,
          'Finished compost/fertilizer/biochar output': 0
        };

        for (const l of allListings) {
          const weightKg = normalizeToKg(l.quantity, l.unit);
          if (categoryKg[l.category] !== undefined) {
            categoryKg[l.category] += weightKg;
          }
          if (!activeUser || l.ownerId === activeUser.id) {
            userCarbonKg += l.metrics?.carbonSavingsKg || 0;
            userMethaneKg += l.metrics?.methaneAvoidedKg || 0;
            userValueDollar += l.priceType === 'For Sale' ? (l.priceValue || 0) * (l.quantity || 1) : 120;
          }
        }

        const totalCategoryKg = Object.values(categoryKg).reduce((a, b) => a + b, 0) || 1;
        const categoryBreakdown = [
          {
            name: 'Organic & Food Waste',
            kg: Math.round(categoryKg['Organic/Food waste']),
            pct: Math.round((categoryKg['Organic/Food waste'] / totalCategoryKg) * 100),
            color: 'bg-amber-500'
          },
          {
            name: 'Industrial Metal & Polymers',
            kg: Math.round(categoryKg['Industrial/Manufacturing waste']),
            pct: Math.round((categoryKg['Industrial/Manufacturing waste'] / totalCategoryKg) * 100),
            color: 'bg-emerald-600'
          },
          {
            name: 'Finished Compost & Biochar',
            kg: Math.round(categoryKg['Finished compost/fertilizer/biochar output']),
            pct: Math.round((categoryKg['Finished compost/fertilizer/biochar output'] / totalCategoryKg) * 100),
            color: 'bg-sky-600'
          }
        ];

        const networkDivertedKg = allUsers.reduce((acc, u) => acc + (u.total_diverted_kg || 0), 0);
        const scopedMatches = activeUser
          ? allMatches.filter((m) => m.seller_id === activeUser.id || m.buyer_id === activeUser.id)
          : allMatches;
        const statusCounts = {
          Proposed: scopedMatches.filter((m) => m.status === 'Proposed').length,
          Accepted: scopedMatches.filter((m) => m.status === 'Accepted').length,
          Scheduled: scopedMatches.filter((m) => m.status === 'Scheduled').length,
          Completed: scopedMatches.filter((m) => m.status === 'Completed').length
        };

        return sendJson(res, 200, {
          analytics: {
            totalDivertedKg: activeUser ? activeUser.totalDivertedKg : networkDivertedKg,
            networkDivertedKg,
            totalCarbonSavingsKg: Math.round(userCarbonKg),
            totalMethaneAvoidedKg: Math.round(userMethaneKg * 10) / 10,
            totalEstimatedSavingsDollar: Math.round(userValueDollar),
            activeListingsCount: activeUser
              ? allListings.filter((l) => l.ownerId === activeUser.id && l.status === 'active').length
              : allListings.filter((l) => l.status === 'active').length,
            statusCounts,
            categoryBreakdown
          }
        });
      }

      // Routes: Real active circular bundles derived from DB listings
      if (method === 'GET' && pathname === '/api/routes') {
        const activeListings = db.prepare(`
          SELECT l.*, u.company_name AS owner_company_name
          FROM listings l
          JOIN users u ON u.id = l.owner_id
          WHERE l.status = 'active'
          ORDER BY l.created_at DESC
        `).all();

        const organicStops = activeListings
          .filter((l) => l.category === 'Organic/Food waste' || l.category === 'Finished compost/fertilizer/biochar output')
          .slice(0, 4)
          .map((l) => {
            let metrics = {};
            try { metrics = JSON.parse(l.metrics || '{}'); } catch { metrics = {}; }
            return {
              name: `${l.owner_company_name} (${l.city.split(',')[0]})`,
              action: `${l.quantity} ${l.unit} • ${l.sub_tag}`,
              type: l.category.includes('Finished') ? 'facility' : 'generator',
              co2Saved: `${(metrics.carbonSavingsKg || 0).toLocaleString()} kg`,
              co2Numeric: metrics.carbonSavingsKg || 0
            };
          });

        const industrialStops = activeListings
          .filter((l) => l.category === 'Industrial/Manufacturing waste')
          .slice(0, 4)
          .map((l) => {
            let metrics = {};
            try { metrics = JSON.parse(l.metrics || '{}'); } catch { metrics = {}; }
            return {
              name: `${l.owner_company_name} (${l.city.split(',')[0]})`,
              action: `${l.quantity} ${l.unit} • ${l.sub_tag}`,
              type: 'generator',
              co2Saved: `${(metrics.carbonSavingsKg || 0).toLocaleString()} kg`,
              co2Numeric: metrics.carbonSavingsKg || 0
            };
          });

        const organicTotal = organicStops.reduce((s, x) => s + x.co2Numeric, 0);
        const industrialTotal = industrialStops.reduce((s, x) => s + x.co2Numeric, 0);

        return sendJson(res, 200, {
          routes: [
            {
              id: 'route_organic_loop',
              title: 'Organic Loop (Compost & Biogas)',
              driver: 'BioLoop Fleet Truck #4',
              stops: organicStops,
              efficiencyGainPct: 38,
              logisticsCostSavedDollar: 145,
              totalEmissionsSavedKg: organicTotal
            },
            {
              id: 'route_industrial_metal',
              title: 'Polymer & Industrial Loop',
              driver: 'Pacific Logistics Carrier #12',
              stops: industrialStops,
              efficiencyGainPct: 24,
              logisticsCostSavedDollar: 85,
              totalEmissionsSavedKg: industrialTotal
            }
          ]
        });
      }

      // Unknown API route
      if (pathname.startsWith('/api/')) {
        return sendJson(res, 404, { error: 'API endpoint not found' });
      }

      // Static built frontend serving (for production `npm start`)
      if (fs.existsSync(distDir)) {
        const cleanPath = pathname === '/' ? '/index.html' : pathname;
        const candidate = path.join(distDir, cleanPath);
        if (candidate.startsWith(distDir) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          const ext = path.extname(candidate).toLowerCase();
          res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
          fs.createReadStream(candidate).pipe(res);
          return;
        }
        const indexHtml = path.join(distDir, 'index.html');
        if (fs.existsSync(indexHtml)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          fs.createReadStream(indexHtml).pipe(res);
          return;
        }
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } catch (err) {
      if (err.message === 'INVALID_JSON') {
        return sendJson(res, 400, { error: 'Invalid JSON request body.' });
      }
      if (err.message === 'PAYLOAD_TOO_LARGE') {
        return sendJson(res, 413, { error: 'Request payload exceeds 1MB limit.' });
      }
      console.error('API Error:', err);
      return sendJson(res, 500, { error: 'Internal server error' });
    }
  };
}

export function createAppServer(db = initDatabase()) {
  return http.createServer(createRequestHandler(db));
}

if (import.meta.url === `file://${path.resolve(process.argv[1] || '').replace(/\\/g, '/')}` || process.argv[1]?.endsWith('server/index.js') || process.argv[1]?.endsWith('server\\index.js')) {
  const port = Number(process.env.PORT || 3001);
  const db = initDatabase();
  const server = createAppServer(db);
  server.listen(port, '0.0.0.0', () => {
  console.log(`EcoLoop API & SQLite server listening on http://0.0.0.0:${port}`);
  });
}
