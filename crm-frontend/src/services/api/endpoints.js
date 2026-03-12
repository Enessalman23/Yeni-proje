export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  admin: {
    products: '/admin/products',
    productDetails: (id) => `/admin/products/${id}`,
    categories: '/admin/categories',
    uploadPdf: '/admin/uploads/pdf',
    uploadImage: '/admin/uploads/image',
    pricing: '/admin/pricing',
    announcements: '/admin/announcements',
    announcementPublish: (id) => `/admin/announcements/${id}/publish`,
    users: '/admin/users',
    userRole: (id) => `/admin/users/${id}/role`,
  },
  realtime: {
    announcementsStream: '/announcements/stream',
    appDataStream: '/realtime/stream',
  },
}
