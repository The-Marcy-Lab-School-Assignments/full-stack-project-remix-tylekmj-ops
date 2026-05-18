const bcrypt = require('bcrypt');
const pool = require('./pool');

const SALT_ROUNDS = 8;

const seed = async () => {
  // Drop tables in reverse dependency order (applications references users via FK)
  await pool.query('DROP TABLE IF EXISTS applications');
  await pool.query('DROP TABLE IF EXISTS users');

  await pool.query(`
    CREATE TABLE users (
      user_id       SERIAL PRIMARY KEY,
      username      TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE applications (
      application_id  SERIAL PRIMARY KEY,
      company         TEXT NOT NULL,
      job_title       TEXT NOT NULL,
      application_url TEXT,
      status          TEXT NOT NULL DEFAULT 'Applied',
      user_id         INT REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  // Hash passwords in parallel — bcrypt is slow by design (CPU-bound hashing)
  const [aliceHash, bobHash] = await Promise.all([
    bcrypt.hash('password123', SALT_ROUNDS),
    bcrypt.hash('password123', SALT_ROUNDS),
  ]);

  // RETURNING captures inserted user_ids so we don't hardcode them
  const { rows: users } = await pool.query(`
    INSERT INTO users (username, password_hash) VALUES
      ('alice', $1),
      ('bob',   $2)
    RETURNING user_id, username
  `, [aliceHash, bobHash]);

  const [alice, bob] = users;

  await pool.query(`
    INSERT INTO applications (company, job_title, application_url, status, user_id) VALUES
      ('Google',   'Frontend Engineer',    'https://careers.google.com/1',  'Applied',      $1),
      ('Spotify',  'Software Engineer',    'https://spotify.com/jobs/2',    'Interviewing', $1),
      ('Airbnb',   'Full-Stack Developer', 'https://careers.airbnb.com/3',  'Rejected',     $1),
      ('Meta',     'React Developer',      'https://metacareers.com/4',     'Applied',      $2),
      ('Stripe',   'Backend Engineer',     'https://stripe.com/jobs/5',     'Offered',      $2),
      ('Vercel',   'DevOps Engineer',      'https://vercel.com/careers/6',  'Interviewing', $2)
  `, [alice.user_id, bob.user_id]);

  return users;
};

seed()
  .then((users) => {
    console.log('Database seeded successfully.');
    console.log(`  Users: ${users.map((u) => u.username).join(', ')}`);
  })
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  })
  .finally(() => pool.end());