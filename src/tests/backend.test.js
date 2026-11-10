import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PassThrough } from 'node:stream';
import { initDatabase } from '../../server/db.js';
import { createRequestHandler } from '../../server/index.js';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecoloop-test-'));
const testDbPath = path.join(tmpDir, 'test.db');

async function req(handler, pathname, { method = 'GET', body = null, cookie = '' } = {}) {
  const reqStream = new PassThrough();
  reqStream.url = pathname;
  reqStream.method = method;
  reqStream.headers = { 'content-type': 'application/json' };
  if (cookie) reqStream.headers.cookie = cookie;

  let status = 200;
  let headers = {};
  const chunks = [];

  const resStream = {
    writeHead(code, hdrs = {}) {
      status = code;
      for (const [k, v] of Object.entries(hdrs)) {
        headers[k.toLowerCase()] = v;
      }
    },
    end(payload = '') {
      if (payload) chunks.push(Buffer.isBuffer(payload) ? payload : Buffer.from(String(payload)));
      resolveDone();
    },
    write(chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    }
  };

  let resolveDone;
  const donePromise = new Promise((resolve) => {
    resolveDone = resolve;
  });

  const handlerPromise = handler(reqStream, resStream);

  if (body) {
    reqStream.write(JSON.stringify(body));
  }
  reqStream.end();

  await Promise.all([handlerPromise, donePromise]);

  const rawBody = Buffer.concat(chunks).toString('utf8');
  const setCookie = headers['set-cookie'];
  const nextCookie = setCookie ? String(setCookie).split(';')[0] : cookie;
  let data = {};
  try {
    data = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    data = {};
  }

  return { status, data, cookie: nextCookie };
}

async function runTests() {
  console.log('🧪 Starting EcoLoop Real SQLite & API End-to-End Tests...\n');

  const db = initDatabase(testDbPath);
  const handler = createRequestHandler(db);

  try {
    // 1. Health & Unauthenticated Guard
    const health = await req(handler, '/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.data.ok, true);

    const unauthPost = await req(handler, '/api/listings', {
      method: 'POST',
      body: { title: 'Unauthorized', quantity: 10, unit: 'kg' }
    });
    assert.strictEqual(unauthPost.status, 401);
    console.log('✅ 1. Health check & unauthenticated write guard verified');

    // 2. Register Seller User
    const sellerReg = await req(handler, '/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Jordan Lee',
        companyName: 'Pacific Scrap Co',
        email: 'jordan@pacificscrap.com',
        password: 'password123',
        businessType: 'Industrial Manufacturer',
        role: 'seller',
        city: 'Oakland, CA'
      }
    });
    assert.strictEqual(sellerReg.status, 201);
    assert(sellerReg.data.user.id);
    assert.strictEqual(sellerReg.data.user.password_hash, undefined);
    const sellerCookie = sellerReg.cookie;

    const meRes = await req(handler, '/api/auth/me', { cookie: sellerCookie });
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.data.user.email, 'jordan@pacificscrap.com');
    console.log('✅ 2. User registration, password hashing & cookie session verified');

    // 3. Logout & Login
    await req(handler, '/api/auth/logout', { method: 'POST', cookie: sellerCookie });
    const afterLogout = await req(handler, '/api/auth/me', { cookie: sellerCookie });
    assert.strictEqual(afterLogout.data.user, null);

    const loginRes = await req(handler, '/api/auth/login', {
      method: 'POST',
      body: { email: 'jordan@pacificscrap.com', password: 'password123' }
    });
    assert.strictEqual(loginRes.status, 200);
    const activeSellerCookie = loginRes.cookie;
    console.log('✅ 3. Logout & password login verified');

    // 4. Create Listing persisted in SQLite
    const createListing = await req(handler, '/api/listings', {
      method: 'POST',
      cookie: activeSellerCookie,
      body: {
        title: 'Clean Aluminum Extrusions',
        category: 'Industrial/Manufacturing waste',
        subTag: 'Metal Scraps - Aluminum',
        quantity: 2,
        unit: 'tons',
        qualityGrade: 'Grade A (99%+ Pure)',
        purityPercentage: 99.2,
        priceType: 'For Sale',
        priceValue: 700
      }
    });
    assert.strictEqual(createListing.status, 201);
    const createdId = createListing.data.listing.id;
    assert(createListing.data.listing.metrics.carbonSavingsKg > 0);

    const listingsRes = await req(handler, '/api/listings');
    assert(listingsRes.data.listings.some((l) => l.id === createdId));
    console.log('✅ 4. Persistent SQLite listing creation & metrics verified');

    // 5. Register Buyer User & Verify Ownership Guard
    const buyerReg = await req(handler, '/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Maya Patel',
        companyName: 'Bay Circular Foundry',
        email: 'maya@bayfoundry.com',
        password: 'password123',
        businessType: 'Industrial Materials Recycler',
        role: 'buyer',
        city: 'San Francisco, CA'
      }
    });
    assert.strictEqual(buyerReg.status, 201);
    const buyerCookie = buyerReg.cookie;

    const forbiddenDelete = await req(handler, `/api/listings/${createdId}`, {
      method: 'DELETE',
      cookie: buyerCookie
    });
    assert.strictEqual(forbiddenDelete.status, 403);

    const forbiddenDemoSwitch = await req(handler, '/api/auth/demo-login', {
      method: 'POST',
      body: { userId: sellerReg.data.user.id }
    });
    assert.strictEqual(forbiddenDemoSwitch.status, 403);
    console.log('✅ 5. Listing delete ownership & demo-login boundary verified');

    // 6. Skip Queue Persistence & Reset
    await req(handler, `/api/listings/${createdId}/skip`, {
      method: 'POST',
      cookie: buyerCookie
    });
    const buyerListings = await req(handler, '/api/listings', { cookie: buyerCookie });
    assert(buyerListings.data.skippedIds.includes(createdId));

    await req(handler, '/api/skips', { method: 'DELETE', cookie: buyerCookie });
    const afterReset = await req(handler, '/api/listings', { cookie: buyerCookie });
    assert(!afterReset.data.skippedIds.includes(createdId));
    console.log('✅ 6. Persistent skip queue & reset verified');

    // 7. Match Creation, Real Chat Messaging & Lifecycle Completion
    const matchRes = await req(handler, '/api/matches', {
      method: 'POST',
      cookie: buyerCookie,
      body: { listingId: createdId }
    });
    assert.strictEqual(matchRes.status, 201);
    const matchId = matchRes.data.match.id;
    assert.strictEqual(matchRes.data.match.messages.length, 1);

    const msgRes = await req(handler, `/api/matches/${matchId}/messages`, {
      method: 'POST',
      cookie: activeSellerCookie,
      body: { text: 'Confirmed, Bay 2 is open tomorrow at 9 AM.' }
    });
    assert.strictEqual(msgRes.status, 201);

    const completeRes = await req(handler, `/api/matches/${matchId}`, {
      method: 'PATCH',
      cookie: activeSellerCookie,
      body: { status: 'Completed', pickupSchedule: 'Completed on Nov 10' }
    });
    assert.strictEqual(completeRes.status, 200);
    assert.strictEqual(completeRes.data.match.status, 'Completed');
    assert.strictEqual(completeRes.data.match.messages.length, 2);

    const updatedSellerMe = await req(handler, '/api/auth/me', { cookie: activeSellerCookie });
    assert.strictEqual(updatedSellerMe.data.user.totalDivertedKg, 2000);
    console.log('✅ 7. Match lifecycle, persistent chat & diversion accounting verified');

    // 8. Reviews, Analytics & Routes
    const revRes = await req(handler, '/api/reviews', {
      method: 'POST',
      cookie: buyerCookie,
      body: {
        targetUserId: sellerReg.data.user.id,
        matchId,
        rating: 5,
        tag: 'Accurate Alloy Specs',
        comment: 'Zero contamination and prompt dock handoff.'
      }
    });
    assert.strictEqual(revRes.status, 201);

    const analyticsRes = await req(handler, '/api/analytics', { cookie: activeSellerCookie });
    assert.strictEqual(analyticsRes.status, 200);
    assert(analyticsRes.data.analytics.totalDivertedKg >= 2000);

    const routesRes = await req(handler, '/api/routes');
    assert.strictEqual(routesRes.status, 200);
    assert(routesRes.data.routes.length >= 2);
    console.log('✅ 8. Persistent reviews, live analytics & routes verified');

    // 9. Database persistence across reopen
    db.close();
    const reopenedDb = initDatabase(testDbPath);
    const row = reopenedDb.prepare('SELECT title FROM listings WHERE id = ?').get(createdId);
    assert.strictEqual(row.title, 'Clean Aluminum Extrusions');
    reopenedDb.close();
    console.log('✅ 9. On-disk SQLite persistence across restart verified\n');

    console.log('🎉 ALL REAL DATABASE & API TESTS PASSED!');
  } finally {
    try { db.close(); } catch {}
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

runTests().catch((err) => {
  console.error('❌ Backend test failed:', err);
  process.exit(1);
});
