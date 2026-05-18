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
    const { company, job_title, application_url } = req.body;
    if (!company || !job_title) {
      return res.status(400).send({ error: 'Company and job title are required.' });
    }
    const application = await applicationModel.create({ company, job_title, application_url }, req.session.user_id);
    res.status(201).send(application);
  } catch (err) {
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

    // First find the application to verify ownership
    const application = await applicationModel.find(application_id);
    if (!application) return res.status(404).send({ error: 'Application not found.' });
    if (application.user_id !== req.session.user_id) {
      return res.status(403).send({ error: 'Not authorized.' });
    }

    // Destroy the application only after ownership has been verified
    const destroyedApplication = await applicationModel.destroy(application_id);
    res.send(destroyedApplication);
  } catch (err) {
    next(err);
  }
};