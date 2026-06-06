import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 15000 })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

export const auth = {
  login:          d  => api.post('/auth/login', d),
  me:             () => api.get('/auth/me'),
  logout:         () => api.post('/auth/logout'),
  updateProfile:  d  => api.put('/auth/me', d),
  changePassword: d  => api.post('/auth/change-password', d),
}

export const students = {
  getAll:    p       => api.get('/students', { params: p }),
  getById:   id      => api.get(`/students/${id}`),
  create:    d       => api.post('/students', d),
  update:    (id, d) => api.put(`/students/${id}`, d),
  delete:    id      => api.delete(`/students/${id}`),
  getBulletin: (id, sem) => api.get(`/students/${id}/bulletin`, { params: { semester: sem }, responseType: 'blob' }),
}

export const classrooms = {
  getAll:  p  => api.get('/classrooms', { params: p }),
  getById: id => api.get(`/classrooms/${id}`),
}

export const grades = {
  getAll:    p       => api.get('/grades', { params: p }),
  create:    d       => api.post('/grades', d),
  bulkCreate: d      => api.post('/grades/bulk', d),
  update:    (id, d) => api.put(`/grades/${id}`, d),
  delete:    id      => api.delete(`/grades/${id}`),
}

export const attendance = {
  getAll:         p       => api.get('/attendance', { params: p }),
  create:         d       => api.post('/attendance', d),
  update:         (id, d) => api.put(`/attendance/${id}`, d),
  justify:        (id, d) => api.post(`/attendance/justify/${id}`, d),
  getDailyReport: (date, cid) => api.get('/attendance/daily-report', { params: { date, class_id: cid } }),
}

export const schedule = {
  getWeekly: (cid, week) => api.get('/schedule/weekly', { params: { class_id: cid, week } }),
  create:    d       => api.post('/schedule', d),
  update:    (id, d) => api.put(`/schedule/${id}`, d),
  delete:    id      => api.delete(`/schedule/${id}`),
}

export const finance = {
  getFees:       p  => api.get('/finance/fees', { params: p }),
  createPayment: d  => api.post('/finance/payments', d),
  getSummary:    () => api.get('/finance/summary'),
  sendReminders: () => api.post('/finance/reminders/send'),
}

export const dashboard = {
  getKPIs:            () => api.get('/dashboard/kpis'),
  getActivityFeed:    () => api.get('/dashboard/activity-feed'),
  getAlerts:          () => api.get('/dashboard/alerts'),
  getAttendanceChart: p  => api.get('/dashboard/attendance-chart', { params: p }),
  getLevelDistribution: () => api.get('/dashboard/level-distribution'),
}

export const notifications = {
  getAll:     p  => api.get('/notifications', { params: p }),
  markRead:   id => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete:     id => api.delete(`/notifications/${id}`),
}

export const staff = {
  getAll:  p       => api.get('/staff', { params: p }),
  getById: id      => api.get(`/staff/${id}`),
  create:  d       => api.post('/staff', d),
  update:  (id, d) => api.put(`/staff/${id}`, d),
  delete:  id      => api.delete(`/staff/${id}`),
}

export const face = {
  recognize:    b64 => axios.post('/ml/recognize-frame', { frame: b64 }),
  enrollPerson: d   => api.post('/face/enroll', d),
  getPersons:   ()  => api.get('/face/persons'),
  getLogs:      p   => api.get('/face/logs', { params: p }),
  getStats:     ()  => api.get('/face/stats'),
}

export default api
