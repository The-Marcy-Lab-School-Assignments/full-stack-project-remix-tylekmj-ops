const bcrypt = require('bcrypt');
const pool = require('./pool');

const SALT_ROUNDS = 8;

const seed = async () => {
  await pool.query('DROP TABLE IF EXISTS applications');
  await pool.query('DROP TABLE IF EXISTS jobs');
  await pool.query('DROP TABLE IF EXISTS users');

  await pool.query(`
    CREATE TABLE users (
      user_id       SERIAL PRIMARY KEY,
      username      TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE jobs (
      job_id      SERIAL PRIMARY KEY,
      company     TEXT NOT NULL,
      job_title   TEXT NOT NULL,
      location    TEXT NOT NULL,
      job_url     TEXT,
      description TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE applications (
      application_id  SERIAL PRIMARY KEY,
      status          TEXT NOT NULL DEFAULT 'Applied',
      user_id         INT REFERENCES users(user_id) ON DELETE CASCADE,
      job_id          INT REFERENCES jobs(job_id) ON DELETE CASCADE,
      UNIQUE(user_id, job_id)
    )
  `);

  const [aliceHash, bobHash] = await Promise.all([
    bcrypt.hash('password123', SALT_ROUNDS),
    bcrypt.hash('password123', SALT_ROUNDS),
  ]);

  const { rows: users } = await pool.query(`
    INSERT INTO users (username, password_hash) VALUES
      ('alice', $1),
      ('bob',   $2)
    RETURNING user_id, username
  `, [aliceHash, bobHash]);

  const [alice, bob] = users;

  const { rows: jobs } = await pool.query(`
    INSERT INTO jobs (company, job_title, location, job_url, description) VALUES
      ('Google',    'Frontend Engineer',    'New York, NY',      'https://careers.google.com/jobs/results/',  'Build and maintain user-facing features for Google Search.'),
      ('Spotify',   'Software Engineer',    'Remote',            'https://lifeatspotify.com/jobs',    'Work on backend services powering music recommendations.'),
      ('Airbnb',    'Full-Stack Developer', 'San Francisco, CA', 'https://careers.airbnb.com',  'Develop features across the Airbnb host and guest experience.'),
      ('Meta',      'React Developer',      'Menlo Park, CA',    'https://metacareers.com/jobs',     'Build React-based interfaces for Meta social products.'),
      ('Stripe',    'Backend Engineer',     'Remote',            'https://stripe.com/jobs/listing',     'Design and scale payment infrastructure for millions of users.'),
      ('Vercel',    'DevOps Engineer',      'Remote',            'https://vercel.com/careers',  'Improve deployment pipelines and infrastructure tooling.'),
      ('Netflix',   'iOS Engineer',         'Los Gatos, CA',     'https://jobs.netflix.com',    'Build the Netflix iOS app experience for millions of subscribers.'),
      ('Figma',     'Product Engineer',     'San Francisco, CA', 'https://www.figma.com/careers',  'Work at the intersection of design tooling and engineering.'),
      ('Linear',    'Software Engineer',    'Remote',            'https://linear.app/careers', 'Help build the fastest project management tool in the industry.'),
      ('Notion',    'Full-Stack Engineer',  'New York, NY',      'https://www.notion.com/careers', 'Develop core product features used by millions of teams worldwide.')
    RETURNING job_id
  `);

  // Seed a couple of applications for alice and bob
  await pool.query(`
    INSERT INTO applications (status, user_id, job_id) VALUES
      ('Interviewing', $1, $2),
      ('Applied',      $1, $3),
      ('Offered',      $4, $5)
  `, [alice.user_id, jobs[0].job_id, jobs[1].job_id, bob.user_id, jobs[3].job_id]);

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