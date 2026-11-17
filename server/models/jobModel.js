const pool = require('../db/pool');

// Returns all jobs ordered by job_id
module.exports.listAll = async () => {
  const query = 'SELECT * FROM jobs ORDER BY job_id ASC';
  const { rows } = await pool.query(query);
  return rows;
};

// Creates a new job listing. Returns the full job row.
module.exports.create = async ({ company, job_title, location, job_url, description }) => {
  const query = `
    INSERT INTO jobs (company, job_title, location, job_url, description)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [company, job_title, location, job_url || null, description || null]);
  return rows[0];
};