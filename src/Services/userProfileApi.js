const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function fetchCustomerProfile(userId) {
  return request(`/profiles/customer/${userId}`);
}

export function updateCustomerProfile(userId, payload) {
  return request(`/profiles/customer/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function fetchGuideProfile(userId) {
  return request(`/profiles/guide/${userId}`);
}

export function updateGuideProfile(userId, payload) {
  return request(`/profiles/guide/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function addGuideCertification(userId, certDto) {
  return request(`/profiles/guide/${userId}/certifications`, {
    method: 'POST',
    body: JSON.stringify(certDto),
  });
}

export function removeGuideCertification(userId, certName) {
  const params = new URLSearchParams({ name: certName });
  return request(`/profiles/guide/${userId}/certifications?${params}`, {
    method: 'DELETE',
  });
}
