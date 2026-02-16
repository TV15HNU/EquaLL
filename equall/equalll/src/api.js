// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // thanks to proxy in package.json
  headers: { 'Content-Type': 'application/json' },
});

// Groups
export const createGroup = (name) => api.post('/groups', { name }).then(r => r.data);
export const getGroup = (groupId) => api.get(`/groups/${groupId}`).then(r => r.data);

// People
export const addPerson = (groupId, name) => api.post(`/groups/${groupId}/people`, { name }).then(r => r.data);
export const updatePerson = (groupId, personId, name) => api.put(`/groups/${groupId}/people/${personId}`, { name }).then(r => r.data);
export const getPeople = (groupId) => getGroup(groupId).then(g => g.people || []);

// Events
export const createEvent = (groupId, { title, amount, payerId }) =>
  api.post(`/groups/${groupId}/events`, { title, amount, payerId }).then(r => r.data);

// Add participants in batch (our backend supports POST /events/{id}/participants)
export const addParticipants = (groupId, eventId, participantsArray) =>
  api.post(`/groups/${groupId}/events/${eventId}/participants`, { participants: participantsArray }).then(r => r.data);

// Convenience: create event then add participants (single frontend action)
export async function createEventWithParticipants(groupId, eventPayload, participantsArray) {
  const ev = await createEvent(groupId, eventPayload);
  if (participantsArray && participantsArray.length) {
    await addParticipants(groupId, ev.id, participantsArray);
  }
  // return refreshed event list
  return api.get(`/groups/${groupId}/events`).then(r => r.data);
}

// Settlement
export const settleDebug = (groupId) => api.post(`/groups/${groupId}/settle-debug`).then(r => r.data);
export const settle = (groupId) => api.post(`/groups/${groupId}/settle`).then(r => r.data);

// Events list
export const getEvents = (groupId) => api.get(`/groups/${groupId}/events`).then(r => r.data);

export default api;
