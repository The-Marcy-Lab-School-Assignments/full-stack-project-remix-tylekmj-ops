import { useState, useEffect } from 'react';
import { fetchAllApplications } from '../adapters/application-adapters';
import ApplicationList from './ApplicationList';

function ApplicationPage({ currentUser, handleLogout }) {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadApplications = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await fetchAllApplications();
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setApplications(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <section>
      <div id="user-controls">
        <span>Welcome, <strong>{currentUser.username}</strong>!</span>
        <button onClick={handleLogout}>Log Out</button>
      </div>
      <div id="tracker-header">
        <h2>My Applications</h2>
        <p className="job-board-subtitle">Manage the status of jobs you're tracking</p>
      </div>
      {isLoading && <p className="loading-text">Loading applications...</p>}
      {error && <p className="error">Something went wrong: {error}</p>}
      <ApplicationList applications={applications} loadApplications={loadApplications} />
    </section>
  );
}

export default ApplicationPage;