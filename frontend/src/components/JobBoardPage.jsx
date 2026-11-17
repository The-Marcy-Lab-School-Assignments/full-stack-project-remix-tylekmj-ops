import { useState, useEffect } from 'react';
import { fetchAllJobs, createJob } from '../adapters/job-adapters';
import { createApplication } from '../adapters/application-adapters';

function JobBoardPage({ currentUser }) {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState(null);
  const [addedJobIds, setAddedJobIds] = useState(new Set());
  const [addError, setAddError] = useState(null);

  const loadJobs = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await fetchAllJobs();
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setJobs(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleAddToTracker = async (job_id) => {
    setAddError(null);
    const { error } = await createApplication(job_id);
    if (error) {
      setAddError(error.message);
      return;
    }
    setAddedJobIds((prev) => new Set(prev).add(job_id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const company = form.elements.company.value;
    const job_title = form.elements.job_title.value;
    const location = form.elements.location.value;
    const job_url = form.elements.job_url.value;
    const description = form.elements.description.value;

    if (!company || !job_title || !location) {
      setFormError('Company, job title, and location are required.');
      return;
    }

    const { error } = await createJob({ company, job_title, location, job_url, description });
    if (error) {
      setFormError(error.message);
      return;
    }

    setFormError(null);
    setShowForm(false);
    form.reset();
    await loadJobs();
  };

  console.log('currentUser in JobBoardPage:', currentUser);

  return (
    <section>
      <div id="job-board-header">
        <div>
          <h2>Job Board</h2>
          <p className="job-board-subtitle">Publicly listed opportunities — visible to everyone</p>
        </div>
        <button className="post-job-btn" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Cancel' : '+ Post a Job'}
        </button>
      </div>

      {showForm && (
        <form id="post-job-form" onSubmit={handleSubmit}>
          <h3>Post a Job Listing</h3>
          {formError && <p className="error">{formError}</p>}
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="pj-company">Company</label>
              <input type="text" name="company" id="pj-company" placeholder="e.g. Google" />
            </div>
            <div className="form-field">
              <label htmlFor="pj-title">Job Title</label>
              <input type="text" name="job_title" id="pj-title" placeholder="e.g. Software Engineer" />
            </div>
            <div className="form-field">
              <label htmlFor="pj-location">Location</label>
              <input type="text" name="location" id="pj-location" placeholder="e.g. Remote" />
            </div>
            <div className="form-field">
              <label htmlFor="pj-url">Job URL (optional)</label>
              <input type="text" name="job_url" id="pj-url" placeholder="e.g. https://careers.google.com" />
            </div>
            <div className="form-field full-width">
              <label htmlFor="pj-description">Description (optional)</label>
              <textarea name="description" id="pj-description" rows={3} placeholder="Brief description of the role..." />
            </div>
          </div>
          <button type="submit">Post Job</button>
        </form>
      )}

      {addError && <p className="error">{addError}</p>}
      {isLoading && <p className="loading-text">Loading jobs...</p>}
      {error && <p className="error">Something went wrong: {error}</p>}

      {!isLoading && !error && jobs.length === 0 && (
        <p className="empty-state">No jobs listed yet. Be the first to post one!</p>
      )}

      {!isLoading && !error && jobs.length > 0 && (
        <ul id="job-board-list">
          {jobs.map((job) => (
            <li key={job.job_id} className="job-board-card">
              <div className="job-board-card-main">
                <div className="job-board-info">
                  <span className="company">{job.company}</span>
                  <span className="job-title">{job.job_title}</span>
                  <span className="job-location">📍 {job.location}</span>
                  {job.description && (
                    <span className="job-description">{job.description}</span>
                  )}
                </div>
                {currentUser && (
                  <button
                    className={`add-to-tracker-btn ${addedJobIds.has(job.job_id) ? 'added' : ''}`}
                    onClick={() => handleAddToTracker(job.job_id)}
                    disabled={addedJobIds.has(job.job_id)}
                  >
                    {addedJobIds.has(job.job_id) ? '✓ Added' : '+ Track'}
                  </button>
                )}
              </div>
              <div className="job-board-card-footer">
                {job.job_url
                  ? <a href={job.job_url} target="_blank" rel="noreferrer">View Job Posting →</a>
                  : <span className="no-link">No link provided</span>
                }
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default JobBoardPage;