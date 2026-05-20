import ApplicationItem from './ApplicationItem';

function ApplicationList({ applications, loadApplications }) {
  if (!applications.length) {
    return <p className="empty-state">No applications yet. Add one above to get started.</p>;
  }

  return (
    <ul id="application-list">
      {applications.map((application) => (
        <ApplicationItem
          key={application.application_id}
          application={application}
          loadApplications={loadApplications}
        />
      ))}
    </ul>
  );
}

export default ApplicationList;