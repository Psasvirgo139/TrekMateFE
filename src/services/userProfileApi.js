import api from './api';

export function fetchCustomerProfile(userId) {
  return api.get(`/profiles/customer/${userId}`);
}

export function updateCustomerProfile(userId, payload) {
  return api.put(`/profiles/customer/${userId}`, payload);
}

export function fetchGuideProfile(userId) {
  return api.get(`/profiles/guide/${userId}`);
}

export function updateGuideProfile(userId, payload) {
  return api.put(`/profiles/guide/${userId}`, payload);
}

export function addGuideCertification(userId, certDto) {
  return api.post(`/profiles/guide/${userId}/certifications`, certDto);
}

export function removeGuideCertification(userId, certName) {
  return api.delete(`/profiles/guide/${userId}/certifications`, {
    params: { name: certName },
  });
}
