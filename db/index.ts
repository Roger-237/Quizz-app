import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// On extrait manuellement les composants si DATABASE_URL pose problème au driver pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requis pour Neon avec le driver 'pg'
  }
});

export const db = drizzle(pool, { schema });