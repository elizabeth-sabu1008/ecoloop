import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { INITIAL_USERS, INITIAL_LISTINGS, INITIAL_MATCHES, INITIAL_REVIEWS } from '../src/data/mockData.js';
import { hashPassword } from './auth.js';

const DEMO_EMAILS = {
  user_greenfork: 'marco@greenfork.com',
  user_bioloop: 'elena@bioloop.org',
  user_apex: 'dave@apexcnc.com',
  user_pacific_polymer: 'aris@pacificpolymer.com',
  user_valley_farm: 'sarah@valleybloom.com',
  user_brewery: 'marcus@freshcoast.co'
};

export function initDatabase(dbPathOverride = null) {
  const dbPath =
    dbPathOverride ||
    process.env.ECOLOOP_DB_PATH ||
    path.join(process.cwd(), 'data', 'ecoloop.db');

  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  if (dbPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      company_name TEXT NOT NULL,
      business_type TEXT NOT NULL,
      role TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT DEFAULT '',
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      verification_status TEXT DEFAULT 'verified',
      rating REAL DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      total_diverted_kg REAL DEFAULT 0,
      min_capacity_kg REAL,
      max_capacity_kg REAL,
      accepted_categories TEXT DEFAULT '[]',
      accepted_tags TEXT DEFAULT '[]',
      bio TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      sub_tag TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      quality_grade TEXT NOT NULL,
      purity_percentage REAL DEFAULT 98.0,
      contamination_flags TEXT DEFAULT '[]',
      urgency_level TEXT DEFAULT 'Flexible',
      urgency_text TEXT DEFAULT '',
      is_recurring INTEGER DEFAULT 0,
      recurrence_schedule TEXT DEFAULT 'One-time lot',
      price_type TEXT DEFAULT 'Free',
      price_value REAL DEFAULT 0,
      city TEXT NOT NULL,
      address TEXT DEFAULT '',
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      availability_window TEXT DEFAULT '',
      photos TEXT DEFAULT '[]',
      description TEXT DEFAULT '',
      metrics TEXT DEFAULT '{}',
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS skips (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, listing_id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      listing_title TEXT NOT NULL,
      listing_category TEXT NOT NULL,
      listing_quantity TEXT NOT NULL,
      seller_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      buyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      match_score INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Proposed',
      estimated_logistics_cost REAL DEFAULT 0,
      estimated_carbon_savings_kg REAL DEFAULT 0,
      estimated_methane_savings_kg REAL DEFAULT 0,
      pickup_schedule TEXT DEFAULT 'Pending negotiation',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sender_name TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      target_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reviewer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      match_id TEXT,
      reviewer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      tag TEXT NOT NULL,
      comment TEXT NOT NULL,
      date TEXT NOT NULL
    );
  `);

  const countRow = db.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (countRow.count === 0) {
    seedInitialData(db);
  }

  return db;
}

function seedInitialData(db) {
  const defaultPasswordHash = hashPassword('ecoloop123');
  const now = new Date().toISOString();

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, email, password_hash, name, company_name, business_type, role,
      city, address, lat, lng, verification_status, rating, review_count,
      total_diverted_kg, min_capacity_kg, max_capacity_kg,
      accepted_categories, accepted_tags, bio, avatar, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of INITIAL_USERS) {
    insertUser.run(
      u.id,
      DEMO_EMAILS[u.id] || `${u.id}@ecoloop.local`,
      defaultPasswordHash,
      u.name,
      u.companyName,
      u.businessType,
      u.role,
      u.location.city,
      u.location.address,
      u.location.lat,
      u.location.lng,
      u.verificationStatus || 'verified',
      u.rating ?? 5.0,
      u.reviewCount ?? 0,
      u.totalDivertedKg ?? 0,
      u.minCapacityKg ?? null,
      u.maxCapacityKg ?? null,
      JSON.stringify(u.acceptedCategories || []),
      JSON.stringify(u.acceptedTags || []),
      u.bio || '',
      u.avatar || '',
      now
    );
  }

  const insertListing = db.prepare(`
    INSERT INTO listings (
      id, owner_id, title, category, sub_tag, quantity, unit,
      quality_grade, purity_percentage, contamination_flags,
      urgency_level, urgency_text, is_recurring, recurrence_schedule,
      price_type, price_value, city, address, lat, lng,
      availability_window, photos, description, metrics, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const l of INITIAL_LISTINGS) {
    insertListing.run(
      l.id,
      l.ownerId,
      l.title,
      l.category,
      l.subTag,
      l.quantity,
      l.unit,
      l.qualityGrade,
      l.purityPercentage ?? 98,
      JSON.stringify(l.contaminationFlags || []),
      l.urgencyLevel || 'Flexible',
      l.urgencyText || '',
      l.isRecurring ? 1 : 0,
      l.recurrenceSchedule || 'One-time lot',
      l.priceType || 'Free',
      l.priceValue ?? 0,
      l.location.city,
      l.location.address || '',
      l.location.lat,
      l.location.lng,
      l.availabilityWindow || '',
      JSON.stringify(l.photos || []),
      l.description || '',
      JSON.stringify(l.metrics || {}),
      l.status || 'active',
      l.createdAt || now
    );
  }

  const insertMatch = db.prepare(`
    INSERT INTO matches (
      id, listing_id, listing_title, listing_category, listing_quantity,
      seller_id, buyer_id, match_score, status,
      estimated_logistics_cost, estimated_carbon_savings_kg, estimated_methane_savings_kg,
      pickup_schedule, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMessage = db.prepare(`
    INSERT INTO messages (id, match_id, sender_id, sender_name, text, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const m of INITIAL_MATCHES) {
    insertMatch.run(
      m.id,
      m.listingId,
      m.listingTitle,
      m.listingCategory,
      m.listingQuantity,
      m.sellerId,
      m.buyerId,
      m.matchScore,
      m.status,
      m.estimatedLogisticsCost ?? 0,
      m.estimatedCarbonSavingsKg ?? 0,
      m.estimatedMethaneSavingsKg ?? 0,
      m.pickupSchedule || 'Pending negotiation',
      m.notes || '',
      m.createdAt || now
    );

    for (const msg of m.messages || []) {
      insertMessage.run(
        msg.id,
        m.id,
        msg.senderId,
        msg.senderName,
        msg.text,
        msg.timestamp || now
      );
    }
  }

  const insertReview = db.prepare(`
    INSERT INTO reviews (id, target_user_id, reviewer_id, match_id, reviewer_name, rating, tag, comment, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const r of INITIAL_REVIEWS) {
    insertReview.run(
      r.id,
      r.targetUserId,
      null,
      null,
      r.reviewerName,
      r.rating,
      r.tag,
      r.comment,
      r.date || now
    );
  }
}

