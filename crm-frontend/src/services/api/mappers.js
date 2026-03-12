const pickFirst = (source, keys, fallback = null) => {
  for (const key of keys) {
    const value = key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), source)
    if (value !== undefined && value !== null) {
      return value
    }
  }

  return fallback
}

export const unwrapData = (responseData) => {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data
  }

  return responseData
}

export const mapUser = (raw = {}) => ({
  id: pickFirst(raw, ['id', 'userId'], null),
  name: pickFirst(raw, ['name', 'fullName', 'username'], 'Unknown User'),
  email: pickFirst(raw, ['email'], ''),
  password: pickFirst(raw, ['password', 'tempPassword'], ''),
  createdAt: pickFirst(raw, ['createdAt', 'created_at'], null),
  role: String(pickFirst(raw, ['role', 'authority'], 'user')).toLowerCase(),
  lastLogin: pickFirst(raw, ['lastLogin', 'lastLoginAt'], 'N/A'),
})

export const mapProduct = (raw = {}) => ({
  id: String(pickFirst(raw, ['id', 'productId'], Date.now())),
  slug: pickFirst(raw, ['slug'], ''),
  name: pickFirst(raw, ['name', 'productName', 'title'], 'Unnamed Product'),
  category: pickFirst(raw, ['category', 'categoryName', 'type'], 'General'),
  subCategory: pickFirst(raw, ['subCategory', 'subcategory', 'sub_category', 'subType', 'subtype'], ''),
  status: pickFirst(raw, ['status', 'state'], 'Aktif'),
  pdfUrl: pickFirst(raw, ['pdfUrl', 'pdf.url', 'documentUrl'], ''),
  pdfName: pickFirst(raw, ['pdfName', 'pdf.name', 'documentName'], ''),
  imageUrl: pickFirst(raw, ['imageUrl', 'image.url', 'thumbnailUrl', 'photoUrl'], ''),
  imageName: pickFirst(raw, ['imageName', 'image.name', 'thumbnailName', 'photoName'], ''),
})

export const mapCategory = (raw = {}) => ({
  id: String(pickFirst(raw, ['id', 'categoryId'], Date.now())),
  slug: pickFirst(raw, ['slug'], ''),
  name: pickFirst(raw, ['name', 'title', 'label'], 'Kategori'),
  description: pickFirst(raw, ['description', 'detail'], ''),
  subCategories: pickFirst(raw, ['subCategories', 'sub_categories'], []),
})

const normalizeMoney = (value) => {
  if (value === null || value === undefined || value === '') {
    return '0 TL'
  }

  const asNumber = Number.parseFloat(String(value).replace(',', '.'))

  if (Number.isNaN(asNumber)) {
    return String(value)
  }

  return `${Math.round(asNumber).toLocaleString('tr-TR')} TL`
}

export const mapPricing = (raw = {}) => {
  const oldRaw = pickFirst(raw, ['old', 'oldPrice', 'previousPrice'], 0)
  const currentRaw = pickFirst(raw, ['current', 'currentPrice', 'newPrice'], 0)
  const oldNumber = Number.parseFloat(String(oldRaw).replace(',', '.')) || 0
  const currentNumber = Number.parseFloat(String(currentRaw).replace(',', '.')) || 0
  const changeRaw = pickFirst(raw, ['change'], null)

  let change = changeRaw
  if (!change) {
    if (oldNumber === 0) {
      change = '0%'
    } else {
      const diff = ((currentNumber - oldNumber) / oldNumber) * 100
      const sign = diff >= 0 ? '+' : ''
      change = `${sign}${diff.toFixed(1)}%`
    }
  }

  return {
    id: String(pickFirst(raw, ['id', 'priceId'], Date.now())),
    plan: pickFirst(raw, ['plan', 'name', 'productName'], 'Unnamed Plan'),
    old: normalizeMoney(oldRaw),
    current: normalizeMoney(currentRaw),
    change,
  }
}

export const mapAnnouncement = (raw = {}) => ({
  id: String(pickFirst(raw, ['id', 'announcementId'], Date.now())),
  title: pickFirst(raw, ['title', 'message', 'name'], 'Untitled Announcement'),
  content: pickFirst(raw, ['content', 'description', 'body'], ''),
  audience: pickFirst(raw, ['audience', 'targetGroup'], 'Tüm kullanıcılar'),
  state: pickFirst(raw, ['state', 'status'], 'Taslak'),
  publishedAt: pickFirst(raw, ['publishedAt', 'createdAt'], null),
})

export const toProductDto = (payload) => ({
  name: payload.name,
  category: payload.category,
  subCategory: payload.subCategory || '',
  status: payload.status,
  pdfUrl: payload.pdfUrl || '',
  pdfName: payload.pdfName || '',
  imageUrl: payload.imageUrl || '',
  imageName: payload.imageName || '',
})

export const toCategoryDto = (payload) => ({
  name: payload.name,
  description: payload.description || '',
  subCategories: Array.isArray(payload.subCategories) ? payload.subCategories : [],
})

export const toPricingDto = (payload) => ({
  plan: payload.plan,
  oldPrice: payload.old,
  currentPrice: payload.current,
})

export const toAnnouncementDto = (payload) => ({
  title: payload.title,
  content: payload.content || '',
  audience: payload.audience,
  state: payload.state,
})

export const toUserDto = (payload) => ({
  name: payload.name,
  email: payload.email,
  password: payload.password,
  role: payload.role,
})


