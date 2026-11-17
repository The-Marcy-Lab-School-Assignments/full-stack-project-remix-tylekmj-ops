import { createApplication } from '../adapters/application-adapters';

function AddApplicationForm({ loadApplications }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const company = form.elements.company.value;
    const job_title = form.elements.job_title.value;
    const application_url = form.elements.application_url.value;

    if (!company || !job_title) return;

    const { error } = await createApplication({ company, job_title, application_url });
    if (error) return console.error(error);

    await loadApplications();
    form.reset();
  };

  return (
    <form id="add-application-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="company-input">Company</label>
        <input type="text" name="company" id="company-input" placeholder="e.g. Google" />
      </div>
      <div className="form-field">
        <label htmlFor="job-title-input">Job Title</label>
        <input type="text" name="job_title" id="job-title-input" placeholder="e.g. Software Engineer" />
      </div>
      <div className="form-field full-width">
        <label htmlFor="url-input">Application URL (optional)</label>
        <input type="text" name="application_url" id="url-input" placeholder="e.g. https://careers.google.com/1" />
      </div>
      <button type="submit">Add Application</button>
    </form>
  );
}

export default AddApplicationForm;