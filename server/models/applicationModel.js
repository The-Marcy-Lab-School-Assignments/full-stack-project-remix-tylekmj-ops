const pool = require('../db/pool');

// Returns all applications for a user, joined with job info
module.exports.listByUser = async (user_id) => {
  const query = `
    SELECT
      a.application_id,
      a.status,
      a.user_id,
      a.job_id,
      j.company,
      j.job_title,
      j.location,
      j.job_url,
      j.description
    FROM applications a
    JOIN jobs j ON a.job_id = j.job_id
    WHERE a.user_id = $1
    ORDER BY a.application_id ASC
  `;
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};

// Returns a single application (used for ownership checks)
module.exports.find = async (application_id) => {
  const query = 'SELECT * FROM applications WHERE application_id = $1';
  const { rows } = await pool.query(query, [application_id]);
  return rows[0] || null;
};

// Creates an application from a job_id. Returns full row joined with job info.
module.exports.create = async (job_id, user_id) => {
  const query = `
    INSERT INTO applications (job_id, user_id)
    VALUES ($1, $2)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [job_id, user_id]);
  // Fetch the full joined row to return job details alongside application
  return module.exports.find(rows[0].application_id).then(async () => {
    const joined = await pool.query(`
      SELECT
        a.application_id,
        a.status,
        a.user_id,
        a.job_id,
        j.company,
        j.job_title,
        j.location,
        j.job_url,
        j.description
      FROM applications a
      JOIN jobs j ON a.job_id = j.job_id
      WHERE a.application_id = $1
    `, [rows[0].application_id]);
    return joined.rows[0];
  });
};

// Updates status. Returns updated row.
module.exports.update = async (application_id, { status }) => {
  const query = 'UPDATE applications SET status = $1 WHERE application_id = $2 RETURNING *';
  const { rows } = await pool.query(query, [status, application_id]);
  return rows[0];
};

// Deletes an application by id. Returns the deleted row.
module.exports.destroy = async (application_id) => {
  const query = 'DELETE FROM applications WHERE application_id = $1 RETURNING *';
  const { rows } = await pool.query(query, [application_id]);
  return rows[0] || null;
};