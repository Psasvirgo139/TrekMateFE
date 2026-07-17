import api from './api';

export function fetchCustomerProfile(userId) {
  return api.get(`/profiles/customer/${userId}`).then((r) => r.data.data);
}

export function updateCustomerProfile(userId, payload) {
  return api.put(`/profiles/customer/${userId}`, payload).then((r) => r.data.data);
}

export function fetchGuideProfile(userId) {
  return api.get(`/profiles/guide/${userId}`).then((r) => r.data.data);
}

export function updateGuideProfile(userId, payload) {
  return api.put(`/profiles/guide/${userId}`, payload).then((r) => r.data.data);
}

export function addGuideCertification(userId, certDto) {
  return api.post(`/profiles/guide/${userId}/certifications`, certDto).then((r) => r.data.data);
}

export function removeGuideCertification(userId, certName) {
  return api.delete(`/profiles/guide/${userId}/certifications`, {
    params: { name: certName },
  }).then((r) => r.data.data);
}
