const handleFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Fetch failed. ${response.status} ${response.statusText}`);
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const fetchAllApplications = async () => {
  return handleFetch('/api/applications');
};

export const createApplication = async (job_id) => {
  return handleFetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id }),
  });
};

export const updateApplication = async (application_id, updates) => {
  return handleFetch(`/api/applications/${application_id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
};

export const deleteApplication = async (application_id) => {
  return handleFetch(`/api/applications/${application_id}`, { method: 'DELETE' });
};