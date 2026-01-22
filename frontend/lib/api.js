const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'An error occurred');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Patient API
export async function getPatients(query = '') {
  const params = query ? `?query=${encodeURIComponent(query)}` : '';
  return fetchAPI(`/patients${params}`);
}

export async function getPatient(id) {
  return fetchAPI(`/patients/${id}`);
}

export async function createPatient(data) {
  return fetchAPI('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePatient(id, data) {
  return fetchAPI(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePatient(id) {
  return fetchAPI(`/patients/${id}`, {
    method: 'DELETE',
  });
}

// Visit API
export async function getVisits(patientId) {
  return fetchAPI(`/patients/${patientId}/visits`);
}

export async function getVisit(visitId) {
  return fetchAPI(`/visits/${visitId}`);
}

export async function createVisit(patientId, data) {
  return fetchAPI(`/patients/${patientId}/visits`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Certificate API
export async function getCertificate(id) {
  return fetchAPI(`/certificates/${id}`);
}

export async function createCertificate(visitId, data) {
  return fetchAPI(`/visits/${visitId}/certificates`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getRecentCertificates(limit = 10) {
  return fetchAPI(`/certificates?limit=${limit}`);
}
