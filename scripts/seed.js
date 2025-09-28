import dotenv from 'dotenv';
import { query } from '../src/db/pool.js';

dotenv.config();

async function seed() {
  try {
    const cities = ['Berlin','Munich','Hamburg','Frankfurt','Stuttgart','Cologne'];
    for (const name of cities) {
      await query('INSERT IGNORE INTO cities (name) VALUES (?)', [name]);
    }

    const categories = [
      { name: 'Housing', slug: 'housing' },
      { name: 'Second-hand Items', slug: 'second-hand' },
      { name: 'Community Events', slug: 'community-events' },
      { name: 'Jobs', slug: 'jobs' },
      { name: 'Travel & Carpool', slug: 'travel' },
      { name: 'Services', slug: 'services' },
    ];
    for (const { name, slug } of categories) {
      await query('INSERT IGNORE INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
    }

    // eslint-disable-next-line no-console
    console.log('Seed completed');
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Seed failed', err);
    process.exit(1);
  }
}

seed();
