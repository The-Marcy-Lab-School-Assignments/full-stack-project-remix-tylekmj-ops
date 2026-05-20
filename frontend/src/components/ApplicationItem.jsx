import { updateApplication, deleteApplication } from '../adapters/application-adapters';

const STATUSES = ['Applied', 'Interviewing', 'Offered', 'Rejected'];

function ApplicationItem({ application, loadApplications }) {
  const handleStatusChange = async (e) => {
    const { error } = await updateApplication(application.application_id, { status: e.target.value });
    if (error) return console.error(error);
    loadApplications();
  };

  const handleDelete = async () => {
    const { error } = await deleteApplication(application.application_id);
    if (error) return console.error(error);
    loadApplications();
  };

  return (
    <li className="application-item">
      <div className="details">
        <span className="company">{application.company}</span>
        <span className="job-title">{application.job_title}</span>
        <span className="job-location">📍 {application.location}</span>
        {application.job_url && (
          <a href={application.job_url} target="_blank" rel="noreferrer">
            View Posting
          </a>
        )}
      </div>
      <select
        value={application.status}
        onChange={handleStatusChange}
        className={`status-${application.status}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button className="delete-btn" onClick={handleDelete}>Remove</button>
    </li>
  );
}

export default ApplicationItem;