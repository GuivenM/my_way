const BASE = import.meta.env.VITE_API_URL ?? '/api'

// ── Client ────────────────────────────────────────────────────────────────────
async function request(method, path, body = null) {
  const token = localStorage.getItem('mw_token')

  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json()

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('mw_token')
      window.dispatchEvent(new Event('auth:expired'))
    }
    throw new Error(data.error || 'Erreur serveur')
  }

  return data
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (body) => api.post('/auth/login', body),
  register: (body) => api.post('/auth/register', body),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get('/dashboard'),
}

// ── Schedule ──────────────────────────────────────────────────────────────────
export const scheduleApi = {
  get: () => api.get('/schedule'),
  replace: (blocks) => api.put('/schedule', { blocks }),
  update: (id, body) => api.put(`/schedule/${id}`, body),
  reorder: (order) => api.post('/schedule/reorder', { order }),
}

// ── Blocks ────────────────────────────────────────────────────────────────────
export const blocksApi = {
  today: (date) => api.get(`/blocks${date ? `?date=${date}` : ''}`),
  initDay: (date) => api.post('/blocks', date ? { date } : {}),
  setStatus: (id, status) => api.put(`/blocks/${id}`, { status }),
  history: () => api.get('/blocks/history'),
}

// ── Projets ───────────────────────────────────────────────────────────────────
export const projectsApi = {
  list: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  create: (body) => api.post('/projects', body),
  update: (id, body) => api.put(`/projects/${id}`, body),
  delete: (id) => api.delete(`/projects/${id}`),
  tasks: {
    list: (pid) => api.get(`/projects/${pid}/tasks`),
    create: (pid, body) => api.post(`/projects/${pid}/tasks`, body),
    update: (id, body) => api.put(`/tasks/${id}`, body),
    delete: (id) => api.delete(`/tasks/${id}`),
  },
  milestones: {
    list: (pid) => api.get(`/projects/${pid}/milestones`),
    create: (pid, body) => api.post(`/projects/${pid}/milestones`, body),
    update: (id, body) => api.put(`/milestones/${id}`, body),
  },
}

// ── Livres ────────────────────────────────────────────────────────────────────
export const booksApi = {
  list: (p = {}) => api.get('/books?' + new URLSearchParams(p)),
  get: (id) => api.get(`/books/${id}`),
  create: (body) => api.post('/books', body),
  update: (id, body) => api.put(`/books/${id}`, body),
  delete: (id) => api.delete(`/books/${id}`),
  quotes: {
    list: (bid) => api.get(`/books/${bid}/quotes`),
    create: (bid, body) => api.post(`/books/${bid}/quotes`, body),
    delete: (id) => api.delete(`/quotes/${id}`),
  },
}

// ── Apprentissage ─────────────────────────────────────────────────────────────
export const learningApi = {
  list: (p = {}) => api.get('/learning?' + new URLSearchParams(p)),
  create: (body) => api.post('/learning', body),
  update: (id, body) => api.put(`/learning/${id}`, body),
  delete: (id) => api.delete(`/learning/${id}`),
}

// ── Musique ───────────────────────────────────────────────────────────────────
export const musicApi = {
  list: (p = {}) => api.get('/music?' + new URLSearchParams(p)),
  create: (body) => api.post('/music', body),
  update: (id, body) => api.put(`/music/${id}`, body),
  delete: (id) => api.delete(`/music/${id}`),
}

// ── Finances ──────────────────────────────────────────────────────────────────
export const financesApi = {
  list: (p = {}) => api.get('/finances?' + new URLSearchParams(p)),
  create: (body) => api.post('/finances', body),
  delete: (id) => api.delete(`/finances/${id}`),
  goals: {
    list: () => api.get('/finances/goals'),
    create: (body) => api.post('/finances/goals', body),
    update: (id, body) => api.put(`/finances/goals/${id}`, body),
  },
}

// ── Santé ─────────────────────────────────────────────────────────────────────
export const healthApi = {
  today: () => api.get('/health'),
  log: (body) => api.post('/health', body),
  update: (body) => api.put('/health', body),
}

// ── Spiritualité ──────────────────────────────────────────────────────────────
export const spiritualApi = {
  practices: {
    list: () => api.get('/spiritual/practices'),
    create: (body) => api.post('/spiritual/practices', body),
    update: (id, body) => api.put(`/spiritual/practices/${id}`, body),
  },
  logs: {
    today: () => api.get('/spiritual'),
    toggle: (body) => api.post('/spiritual', body),
  },
}

// ── Journal ───────────────────────────────────────────────────────────────────
export const journalApi = {
  get: (date) => api.get(`/journal${date ? `?date=${date}` : ''}`),
  save: (body) => api.post('/journal', body),
  history: (limit = 30) => api.get(`/journal/history?limit=${limit}`),

}

// ── Notes ─────────────────────────────────────────────────────────────────────
export const notesApi = {
  list: (p = {}) => api.get('/notes?' + new URLSearchParams(p)),
  create: (body) => api.post('/notes', body),
  update: (id, body) => api.put(`/notes/${id}`, body),
  delete: (id) => api.delete(`/notes/${id}`),
}

// ── Vision ────────────────────────────────────────────────────────────────────
export const visionApi = {
  get: () => api.get('/vision'),
  updateText: (body) => api.put('/vision', body),
  goals: {
    list: () => api.get('/vision/goals'),
    create: (body) => api.post('/vision/goals', body),
    update: (id, body) => api.put(`/vision/goals/${id}`, body),
    delete: (id) => api.delete(`/vision/goals/${id}`),
  },
}

// ── Réseau ────────────────────────────────────────────────────────────────────
export const networkApi = {
  list: () => api.get('/network'),
  create: (body) => api.post('/network', body),
  update: (id, body) => api.put(`/network/${id}`, body),
  delete: (id) => api.delete(`/network/${id}`),
}
