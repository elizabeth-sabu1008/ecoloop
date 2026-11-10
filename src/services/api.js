async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  getMe: () => request('/api/auth/me'),
  register: (payload) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  demoLogin: (userId) =>
    request('/api/auth/demo-login', { method: 'POST', body: JSON.stringify({ userId }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),

  getUsers: () => request('/api/users'),
  getListings: () => request('/api/listings'),
  createListing: (payload) =>
    request('/api/listings', { method: 'POST', body: JSON.stringify(payload) }),
  deleteListing: (id) =>
    request(`/api/listings/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  skipListing: (id) =>
    request(`/api/listings/${encodeURIComponent(id)}/skip`, { method: 'POST' }),
  resetSkips: () => request('/api/skips', { method: 'DELETE' }),

  getMatches: () => request('/api/matches'),
  createMatch: (listingId) =>
    request('/api/matches', { method: 'POST', body: JSON.stringify({ listingId }) }),
  updateMatch: (matchId, payload) =>
    request(`/api/matches/${encodeURIComponent(matchId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  sendMessage: (matchId, text) =>
    request(`/api/matches/${encodeURIComponent(matchId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text })
    }),

  getReviews: () => request('/api/reviews'),
  createReview: (payload) =>
    request('/api/reviews', { method: 'POST', body: JSON.stringify(payload) }),

  getAnalytics: () => request('/api/analytics'),
  getRoutes: () => request('/api/routes')
};

