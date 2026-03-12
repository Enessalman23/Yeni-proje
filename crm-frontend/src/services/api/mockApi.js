const STORAGE_KEYS = {
  products: 'mock-products',
  categories: 'mock-categories',
  pricing: 'mock-pricing',
  announcements: 'mock-announcements',
  users: 'mock-users',
  authUser: 'mock-auth-user',
}

const AUTH_USERS = [
  { id: 'auth-1', email: 'admin@solveline.com', password: 'Admin123!', role: 'admin', name: 'System Admin' },
  { id: 'auth-2', email: 'manager@solveline.com', password: 'Manager123!', role: 'manager', name: 'Sales Manager' },
  { id: 'auth-3', email: 'user@solveline.com', password: 'User123!', role: 'user', name: 'CRM User' },
]

const defaultProducts = [
  { id: 'prod-ai-1', name: 'Sosyal Medya', category: 'Yapay Zeka Çözümleri (Solvenix Serisi)', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-ai-2', name: 'Kalite Değerlendirme', category: 'Yapay Zeka Çözümleri (Solvenix Serisi)', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-ai-3', name: 'Touch', category: 'Yapay Zeka Çözümleri (Solvenix Serisi)', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-ai-4', name: 'Outbound', category: 'Yapay Zeka Çözümleri (Solvenix Serisi)', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-ai-5', name: 'LLM', category: 'Yapay Zeka Çözümleri (Solvenix Serisi)', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-ai-6', name: 'Sesli Asistan', category: 'Yapay Zeka Çözümleri (Solvenix Serisi)', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-crm-1', name: 'Callintech (CRM)', category: 'Yazılım ve CRM Çözümleri', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-crm-2', name: 'Ncvav (Santral)', category: 'Yazılım ve CRM Çözümleri', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-tel-1', name: 'Sabit Telefon', category: 'Telekom ve Bağlantı Hizmetleri', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-tel-2', name: 'GSM Gateway', category: 'Telekom ve Bağlantı Hizmetleri', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-tel-3', name: 'SMS', category: 'Telekom ve Bağlantı Hizmetleri', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-tel-4', name: 'İnternet', category: 'Telekom ve Bağlantı Hizmetleri', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-tel-5', name: 'SIP Trunk', category: 'Telekom ve Bağlantı Hizmetleri', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-tel-6', name: 'IYS', category: 'Telekom ve Bağlantı Hizmetleri', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-inf-1', name: 'Sunucu Kiralama (GPU dahil)', category: 'Altyapı ve Donanım', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-inf-2', name: 'VPN', category: 'Altyapı ve Donanım', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-inf-3', name: 'IP Telefon', category: 'Altyapı ve Donanım', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-inf-4', name: 'Kulaklık', category: 'Altyapı ve Donanım', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-inf-5', name: 'Network ve Video Konferans', category: 'Altyapı ve Donanım', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-vas-1', name: 'STT/TTS', category: 'Katma Değerli Servisler', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-vas-2', name: 'Sesli Mesaj', category: 'Katma Değerli Servisler', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
  { id: 'prod-vas-3', name: 'Profesyonel Seslendirme', category: 'Katma Değerli Servisler', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '' },
]

const buildDefaultCategories = (products) =>
  [...new Set(products.map((item) => item.category))].map((name, index) => ({
    id: `cat-${index + 1}`,
    name,
    description: '',
  }))

const defaults = {
  products: defaultProducts,
  categories: buildDefaultCategories(defaultProducts),
  pricing: [
    { id: 'price-1', plan: 'Konuşma Başlangıç', old: '1150', current: '1250', change: '+8.7%' },
    { id: 'price-2', plan: 'Toplu SMS 10.000', old: '940', current: '990', change: '+5.3%' },
    { id: 'price-3', plan: 'API Pro', old: '2300', current: '2400', change: '+4.3%' },
    { id: 'price-4', plan: 'Enes Pro', old: '500', current: '1000', change: '+100%' },

  ],
  announcements: [
    {
      id: 'ann-1',
      title: 'Nisan Zam Duyurusu',
      content: 'Nisan ayi fiyat guncellemeleri sistemde yayina alinmistir.',
      audience: 'Tüm kullanıcılar',
      state: 'Yayınlandı',
      publishedAt: new Date().toISOString(),
    },
  ],
  users: [
    { id: 'usr-1', name: 'System Admin', email: 'admin@solveline.com', password: 'Admin123!', role: 'admin', createdAt: '2026-01-01T09:00:00.000Z', lastLogin: 'N/A' },
    { id: 'usr-2', name: 'Sales Manager', email: 'manager@solveline.com', password: 'Manager123!', role: 'manager', createdAt: '2026-01-01T09:00:00.000Z', lastLogin: 'N/A' },
    { id: 'usr-3', name: 'CRM User', email: 'user@solveline.com', password: 'User123!', role: 'user', createdAt: '2026-01-01T09:00:00.000Z', lastLogin: 'N/A' },
  ],
}

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
  return value
}

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

const toMoney = (value) => `${Math.round(Number.parseFloat(String(value).replace(',', '.')) || 0)} TL`

const toChange = (oldV, curV) => {
  const oldN = Number.parseFloat(String(oldV).replace(',', '.')) || 0
  const curN = Number.parseFloat(String(curV).replace(',', '.')) || 0
  if (!oldN) return '0%'
  const diff = ((curN - oldN) / oldN) * 100
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
}

const ensureMockCategory = (name) => {
  const clean = String(name || '').trim()
  if (!clean) return
  const categories = read(STORAGE_KEYS.categories, defaults.categories)
  if (categories.some((item) => item.name === clean)) return
  const created = { id: `cat-${Date.now()}`, name: clean, description: '' }
  write(STORAGE_KEYS.categories, [...categories, created])
}

export const mockLogin = async ({ email, password }) => {
  await delay()

  const normalized = String(email).trim().toLowerCase()
  const dynamicUsers = read(STORAGE_KEYS.users, defaults.users)
  const found =
    AUTH_USERS.find((item) => item.email === normalized && item.password === password) ||
    dynamicUsers.find((item) => String(item.email || '').toLowerCase() === normalized && item.password === password)

  if (!found) {
    const error = new Error('E-posta veya şifre hatali.')
    error.status = 401
    throw error
  }

  const user = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
    createdAt: found.createdAt || null,
    lastLogin: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(user))

  return {
    accessToken: `mock-access-${Date.now()}`,
    refreshToken: `mock-refresh-${Date.now()}`,
    user,
  }
}

export const mockMe = async () => {
  await delay(80)
  const raw = localStorage.getItem(STORAGE_KEYS.authUser)
  if (!raw) throw new Error('No mock session')
  return JSON.parse(raw)
}

export const mockLogout = async () => {
  await delay(50)
  localStorage.removeItem(STORAGE_KEYS.authUser)
}

export const mockGetProducts = async () => {
  await delay()
  return read(STORAGE_KEYS.products, defaults.products)
}

export const mockGetCategories = async () => {
  await delay()
  return read(STORAGE_KEYS.categories, defaults.categories)
}

export const mockCreateCategory = async (payload) => {
  await delay()
  const name = String(payload?.name || '').trim()
  const description = String(payload?.description || '').trim()
  const subCategories = Array.isArray(payload?.subCategories)
    ? payload.subCategories.map((item) => String(item || "").trim()).filter(Boolean)
    : []
  if (!name) {
    const error = new Error('Kategori adi zorunlu.')
    error.status = 400
    throw error
  }

  const items = read(STORAGE_KEYS.categories, defaults.categories)
  const exists = items.some((item) => item.name.toLowerCase() === name.toLowerCase())
  if (exists) {
    const error = new Error('Bu kategori zaten mevcut.')
    error.status = 409
    throw error
  }

  const created = { id: `cat-${Date.now()}`, name, description, subCategories }
  write(STORAGE_KEYS.categories, [...items, created])
  return created
}

export const mockUpdateCategory = async (id, payload) => {
  await delay()
  const items = read(STORAGE_KEYS.categories, defaults.categories)
  const index = items.findIndex((item) => item.id === id)
  if (index < 0) {
    const error = new Error('Kategori bulunamadi.')
    error.status = 404
    throw error
  }

  const name = payload?.name !== undefined ? String(payload.name || '').trim() : items[index].name
  const description = payload?.description !== undefined ? String(payload.description || "").trim() : items[index].description
  const subCategories = payload?.subCategories !== undefined
    ? Array.isArray(payload.subCategories)
      ? payload.subCategories.map((item) => String(item || "").trim()).filter(Boolean)
      : []
    : items[index].subCategories || []

  if (!name) {
    const error = new Error('Kategori adi zorunlu.')
    error.status = 400
    throw error
  }

  const exists = items.some((item) => item.id !== id && item.name.toLowerCase() === name.toLowerCase())
  if (exists) {
    const error = new Error('Bu kategori zaten mevcut.')
    error.status = 409
    throw error
  }

  const current = items[index]
  const updated = { ...current, name, description, subCategories }
  items[index] = updated
  write(STORAGE_KEYS.categories, [...items])

  if (current.name !== name) {
    const products = read(STORAGE_KEYS.products, defaults.products)
    const nextProducts = products.map((product) =>
      product.category === current.name ? { ...product, category: name } : product,
    )
    write(STORAGE_KEYS.products, nextProducts)
  }

  return updated
}

export const mockRemoveCategory = async (id) => {
  await delay()
  const items = read(STORAGE_KEYS.categories, defaults.categories)
  const target = items.find((item) => item.id === id)
  if (!target) return
  const products = read(STORAGE_KEYS.products, defaults.products)
  const hasProducts = products.some((product) => product.category === target.name)
  if (hasProducts) {
    const error = new Error('Bu kategoriye bağlı ürünler var. Önce ürünleri taşıyın.')
    error.status = 409
    throw error
  }

  const nextCategories = items.filter((item) => item.id !== id)
  write(STORAGE_KEYS.categories, nextCategories)
}

export const mockCreateProduct = async (payload) => {
  await delay()
  const items = read(STORAGE_KEYS.products, defaults.products)
  const created = { id: `prod-${Date.now()}`, ...payload }
  ensureMockCategory(created.category)
  write(STORAGE_KEYS.products, [...items, created])
  return created
}

export const mockUpdateProduct = async (id, payload) => {
  await delay()
  const items = read(STORAGE_KEYS.products, defaults.products)
  const updated = items.map((item) => (item.id === id ? { ...item, ...payload } : item))
  const updatedItem = updated.find((item) => item.id === id)
  if (updatedItem) {
    ensureMockCategory(updatedItem.category)
  }
  write(STORAGE_KEYS.products, updated)
  return updated.find((item) => item.id === id)
}

export const mockRemoveProduct = async (id) => {
  await delay()
  const items = read(STORAGE_KEYS.products, defaults.products)
  write(STORAGE_KEYS.products, items.filter((item) => item.id !== id))
}

export const mockGetPricing = async () => {
  await delay()
  return read(STORAGE_KEYS.pricing, defaults.pricing)
}

export const mockCreatePricing = async (payload) => {
  await delay()
  const items = read(STORAGE_KEYS.pricing, defaults.pricing)
  const created = {
    id: `price-${Date.now()}`,
    plan: payload.plan,
    old: toMoney(payload.old),
    current: toMoney(payload.current),
    change: toChange(payload.old, payload.current),
  }
  write(STORAGE_KEYS.pricing, [...items, created])
  return created
}

export const mockUpdatePricing = async (id, payload) => {
  await delay()
  const items = read(STORAGE_KEYS.pricing, defaults.pricing)
  const updated = items.map((item) =>
    item.id === id
      ? { ...item, plan: payload.plan, old: toMoney(payload.old), current: toMoney(payload.current), change: toChange(payload.old, payload.current) }
      : item,
  )
  write(STORAGE_KEYS.pricing, updated)
  return updated.find((item) => item.id === id)
}

export const mockRemovePricing = async (id) => {
  await delay()
  const items = read(STORAGE_KEYS.pricing, defaults.pricing)
  write(STORAGE_KEYS.pricing, items.filter((item) => item.id !== id))
}

export const mockGetAnnouncements = async () => {
  await delay()
  return read(STORAGE_KEYS.announcements, defaults.announcements)
}

export const mockCreateAnnouncement = async (payload) => {
  await delay()
  const items = read(STORAGE_KEYS.announcements, defaults.announcements)
  const created = {
    id: `ann-${Date.now()}`,
    title: payload.title,
    content: payload.content || '',
    audience: payload.audience,
    state: payload.state,
    publishedAt: payload.state === 'Yayınlandı' ? new Date().toISOString() : null,
  }
  write(STORAGE_KEYS.announcements, [created, ...items])
  return created
}

export const mockPublishAnnouncement = async (id) => {
  await delay()
  const items = read(STORAGE_KEYS.announcements, defaults.announcements)
  const updated = items.map((item) => (item.id === id ? { ...item, state: 'Yayınlandı', publishedAt: new Date().toISOString() } : item))
  write(STORAGE_KEYS.announcements, updated)
  return updated.find((item) => item.id === id)
}

export const mockUpdateAnnouncement = async (id, payload) => {
  await delay()
  const items = read(STORAGE_KEYS.announcements, defaults.announcements)
  const updated = items.map((item) =>
    item.id === id
      ? {
          ...item,
          title: payload.title !== undefined ? payload.title : item.title,
          content: payload.content !== undefined ? payload.content : item.content,
          audience: payload.audience !== undefined ? payload.audience : item.audience,
          state: payload.state !== undefined ? payload.state : item.state,
          publishedAt: payload.state === 'Yayınlandı' && !item.publishedAt ? new Date().toISOString() : item.publishedAt,
        }
      : item,
  )
  write(STORAGE_KEYS.announcements, updated)
  return updated.find((item) => item.id === id)
}

export const mockRemoveAnnouncement = async (id) => {
  await delay()
  const items = read(STORAGE_KEYS.announcements, defaults.announcements)
  write(STORAGE_KEYS.announcements, items.filter((item) => item.id !== id))
}

export const mockGetUsers = async () => {
  await delay()
  return read(STORAGE_KEYS.users, defaults.users)
}

export const mockCreateUser = async (payload) => {
  await delay()
  const items = read(STORAGE_KEYS.users, defaults.users)
  const created = {
    id: `usr-${Date.now()}`,
    name: payload.name,
    role: payload.role,
    email: payload.email || '',
    password: payload.password || '',
    createdAt: new Date().toISOString(),
    lastLogin: 'Henüz giriş yapmadı',
  }
  write(STORAGE_KEYS.users, [...items, created])
  return created
}

export const mockUpdateUserRole = async (id, role) => {
  await delay()
  const items = read(STORAGE_KEYS.users, defaults.users)
  const updated = items.map((item) => (item.id === id ? { ...item, role: String(role).toLowerCase() } : item))
  write(STORAGE_KEYS.users, updated)
  return updated.find((item) => item.id === id)
}

export const mockUpdateUserPassword = async (id, password) => {
  await delay()
  const items = read(STORAGE_KEYS.users, defaults.users)
  const updated = items.map((item) => (item.id === id ? { ...item, password: String(password) } : item))
  write(STORAGE_KEYS.users, updated)
  return { success: true }
}

export const mockRemoveUser = async (id) => {
  await delay()
  const items = read(STORAGE_KEYS.users, defaults.users)
  write(STORAGE_KEYS.users, items.filter((item) => item.id !== id))
}









