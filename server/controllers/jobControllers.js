const jobModel = require('../models/jobModel');

module.exports.listJobs = async (req, res, next) => {
  try {
    const jobs = await jobModel.listAll();
    res.send(jobs);
  } catch (err) {
    next(err);
  }
};

module.exports.createJob = async (req, res, next) => {
  try {
    const { company, job_title, location, job_url, description } = req.body;
    if (!company || !job_title || !location) {
      return res.status(400).send({ error: 'Company, job title, and location are required.' });
    }
    const job = await jobModel.create({ company, job_title, location, job_url, description });
    res.status(201).send(job);
  } catch (err) {
    next(err);
  }
};