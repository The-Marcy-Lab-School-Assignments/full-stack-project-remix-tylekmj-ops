const applicationModel = require('../models/applicationModel');

module.exports.listApplications = async (req, res, next) => {
  try {
    const applications = await applicationModel.listByUser(req.session.user_id);
    res.send(applications);
  } catch (err) {
    next(err);
  }
};

module.exports.createApplication = async (req, res, next) => {
  try {
    const { job_id } = req.body;
    if (!job_id) {
      return res.status(400).send({ error: 'job_id is required.' });
    }
    const application = await applicationModel.create(job_id, req.session.user_id);
    res.status(201).send(application);
  } catch (err) {
    // Unique constraint violation — user already applied to this job
    if (err.code === '23505') {
      return res.status(409).send({ error: 'You have already added this job to your tracker.' });
    }
    next(err);
  }
};

module.exports.updateApplication = async (req, res, next) => {
  try {
    const { application_id } = req.params;
    const application = await applicationModel.find(application_id);
    if (!application) return res.status(404).send({ error: 'Application not found.' });
    if (application.user_id !== req.session.user_id) {
      return res.status(403).send({ error: 'Not authorized.' });
    }
    const updatedApplication = await applicationModel.update(application_id, req.body);
    res.send(updatedApplication);
  } catch (err) {
    next(err);
  }
};

module.exports.deleteApplication = async (req, res, next) => {
  try {
    const { application_id } = req.params;
    const application = await applicationModel.find(application_id);
    if (!application) return res.status(404).send({ error: 'Application not found.' });
    if (application.user_id !== req.session.user_id) {
      return res.status(403).send({ error: 'Not authorized.' });
    }
    const destroyedApplication = await applicationModel.destroy(application_id);
    res.send(destroyedApplication);
  } catch (err) {
    next(err);
  }
};