import cors from 'cors'
import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const DB_PATH = path.join(ROOT_DIR, 'data', 'db.json')
const UPLOAD_DIR = path.join(ROOT_DIR, 'uploads', 'pdfs')
const IMAGE_UPLOAD_DIR = path.join(ROOT_DIR, 'uploads', 'images')
const PORT = Number(process.env.PORT || 8080)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
const EXTRA_ALLOWED_ORIGINS = String(process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)



const slugify = (value, maxLength = 60) => {
  const base = String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .replace(/-+/g, '-')

  if (!base) return ''
  if (!maxLength) return base
  return base.slice(0, maxLength).replace(/-+$/g, '')
}

const isAllowedOrigin = (origin) => {
  if (!origin) return true
  if (origin === FRONTEND_ORIGIN) return true
  if (EXTRA_ALLOWED_ORIGINS.includes(origin)) return true
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
}

const app = express()
const sseClients = new Set()
const accessTokens = new Map()
const refreshTokens = new Map()

const parseMoneyStr = (value) => Number.parseFloat(String(value).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0

const toMoney = (value) => `${Math.round(parseMoneyStr(value))} TL`

const toChange = (oldV, curV) => {
  const oldN = parseMoneyStr(oldV)
  const curN = parseMoneyStr(curV)
  if (!oldN) return '0%'
  const diff = ((curN - oldN) / oldN) * 100
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
}

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
const sendError = (res, status, message) => {
  res.status(status).json({ message })
}

const sanitizeFileName = (name) =>
  String(name || 'document.pdf')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')

const slugifyFileBase = (originalName, fallback) => {
  const parsed = path.parse(String(originalName || fallback))
  const base = slugify(parsed.name)
  return base || slugify(fallback) || 'file'
}

const normalizeText = (value) => String(value || '').trim().toLowerCase()

const readDb = async () => {
  const raw = await fs.readFile(DB_PATH, 'utf-8')
  const sanitized = raw.replace(/^\uFEFF+/, '')
  return JSON.parse(sanitized)
}

const writeDb = async (nextDb) => {
  await fs.writeFile(DB_PATH, JSON.stringify(nextDb, null, 2), 'utf-8')
}

const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt || null,
  role: user.role,
  lastLogin: user.lastLogin || 'N/A',
})

const adminUser = (user) => ({
  ...safeUser(user),
  password: user.password || '',
})

const createToken = (prefix, userId) => `${prefix}-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const emitSse = (payload) => {
  const data = `data: ${JSON.stringify(payload)}\n\n`
  for (const res of sseClients) {
    res.write(data)
  }
}

const ensureCategories = (db) => {
  if (!Array.isArray(db.categories)) {
    db.categories = []
  }

  if (db.categories.length > 0) {
    return false
  }

  const uniqueNames = [...new Set((db.products || []).map((item) => item.category).filter(Boolean))]
  db.categories = uniqueNames.map((name) => ({
    id: makeId('cat'),
    name,
    slug: slugify(name),
    subCategories: [],
    description: '',
  }))
  return true
}

const ensureCategoryExists = (db, name) => {
  if (!name) return null
  ensureCategories(db)
  const normalized = normalizeText(name)
  const existing = db.categories.find((item) => normalizeText(item.name) === normalized)
  if (existing) return existing

  const created = {
    id: makeId('cat'),
    name,
    slug: slugify(name),
    subCategories: [],
    description: '',
  }
  db.categories.push(created)
  emitSse({ type: 'category_created', payload: created })
  return created
}

const authMiddleware = (req, res, next) => {
  const bearer = req.headers.authorization || ''
  const tokenFromHeader = bearer.startsWith('Bearer ') ? bearer.slice(7).trim() : ''
  const token = tokenFromHeader || String(req.query.access_token || '')

  if (!token) {
    sendError(res, 401, 'Yetkilendirme gerekli.')
    return
  }

  const userId = accessTokens.get(token)
  if (!userId) {
    sendError(res, 401, 'Geçersiz token.')
    return
  }

  req.userId = userId
  req.accessToken = token
  next()
}

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.pdf'
    const base = slugifyFileBase(file.originalname || 'document', 'document')
    cb(null, `${base}-${Date.now()}${ext}`)
  },
})

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (String(file.mimetype).toLowerCase() !== 'application/pdf') {
      cb(new Error('Sadece PDF yüklenebilir.'))
      return
    }

    cb(null, true)
  },
})

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGE_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png'
    const base = slugifyFileBase(file.originalname || 'image', 'image')
    cb(null, `${base}-${Date.now()}${ext}`)
  },
})

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const type = String(file.mimetype || '').toLowerCase()
    if (!type.startsWith('image/')) {
      cb(new Error('Sadece gorsel yuklenebilir.'))
      return
    }
    cb(null, true)
  },
})

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('CORS origin izni yok.'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(path.join(ROOT_DIR, 'uploads')))

app.get('/api/health', (_req, res) => {
  res.json({ data: { status: 'ok' } })
})

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const db = await readDb()
  const user = db.users.find((item) => item.email.toLowerCase() === email && item.password === password)

  if (!user) {
    sendError(res, 401, 'E-posta veya şifre hatalı.')
    return
  }

  user.lastLogin = new Date().toISOString()
  await writeDb(db)

  const accessToken = createToken('access', user.id)
  const refreshToken = createToken('refresh', user.id)
  accessTokens.set(accessToken, user.id)
  refreshTokens.set(refreshToken, user.id)

  res.json({ data: { accessToken, refreshToken, user: safeUser(user) } })
})

app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = String(req.body?.refreshToken || '')
  const userId = refreshTokens.get(refreshToken)

  if (!userId) {
    sendError(res, 401, 'Geçersiz refresh token.')
    return
  }

  const db = await readDb()
  const user = db.users.find((item) => item.id === userId)
  if (!user) {
    sendError(res, 401, 'Kullanıcı bulunamadı.')
    return
  }

  const nextAccessToken = createToken('access', user.id)
  accessTokens.set(nextAccessToken, user.id)

  res.json({ data: { accessToken: nextAccessToken, refreshToken, user: safeUser(user) } })
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const db = await readDb()
  const user = db.users.find((item) => item.id === req.userId)

  if (!user) {
    sendError(res, 401, 'Kullanıcı bulunamadı.')
    return
  }

  res.json({ data: safeUser(user) })
})

app.post('/api/auth/logout', (req, res) => {
  const refreshToken = String(req.body?.refreshToken || '')
  if (refreshToken) {
    refreshTokens.delete(refreshToken)
  }

  res.json({ data: { success: true } })
})

// PDF yükleme kısmı
app.post('/api/admin/uploads/pdf', authMiddleware, upload.single('pdf'), (req, res) => {
  if (!req.file) {
    sendError(res, 400, 'PDF dosyası zorunludur.')
    return
  }

  const host = req.get('host') || `localhost:${PORT}`
  const pdfUrl = `${req.protocol}://${host}/uploads/pdfs/${req.file.filename}`
  res.status(201).json({
    data: {
      pdfUrl,
      pdfName: req.file.originalname,
      fileName: req.file.filename,
    },
  })
})

// Gorsel yukleme
app.post('/api/admin/uploads/image', authMiddleware, imageUpload.single('image'), (req, res) => {
  if (!req.file) {
    sendError(res, 400, 'Gorsel dosyasi zorunludur.')
    return
  }

  const host = req.get('host') || `localhost:${PORT}`
  const imageUrl = `${req.protocol}://${host}/uploads/images/${req.file.filename}`
  res.status(201).json({
    data: {
      imageUrl,
      imageName: req.file.originalname,
      fileName: req.file.filename,
    },
  })
})

app.get('/api/admin/products', authMiddleware, async (_req, res) => {
  const db = await readDb()
  res.json({ data: db.products })
})

app.get('/api/admin/products/:id', authMiddleware, async (req, res) => {
  const db = await readDb()
  const product = db.products.find((item) => item.id === req.params.id)
  if (!product) {
    sendError(res, 404, 'Ürün bulunamadı.')
    return
  }
  res.json({ data: product })
})

app.post('/api/admin/products', authMiddleware, async (req, res) => {
  const db = await readDb()
  const payload = req.body || {}
  const category = String(payload.category || '').trim()
  if (!category) {
    sendError(res, 400, 'Kategori adı zorunlu.')
    return
  }
  const created = {
    id: makeId('prod'),
    slug: slugify(payload.name || 'Unnamed Product'),
    name: payload.name || 'Unnamed Product',
    category,
    subCategory: String(payload.subCategory || payload.sub_category || '').trim(),
    status: payload.status || 'Taslak',
    pdfUrl: payload.pdfUrl || '',
    pdfName: payload.pdfName || '',
    imageUrl: payload.imageUrl || '',
    imageName: payload.imageName || '',
  }

  db.products.push(created)
  ensureCategoryExists(db, created.category)
  await writeDb(db)
  emitSse({ type: 'product_created', payload: created })
  res.status(201).json({ data: created })
})

app.put('/api/admin/products/:id', authMiddleware, async (req, res) => {
  const db = await readDb()
  const index = db.products.findIndex((item) => item.id === req.params.id)

  if (index < 0) {
    sendError(res, 404, 'Ürün bulunamadı.')
    return
  }

  const current = db.products[index]
  const next = {
    ...current,
    ...req.body,
    id: current.id,
  }
  next.slug = slugify(next.name || current.name)
  if (req.body && ('subCategory' in req.body || 'sub_category' in req.body)) {
    next.subCategory = String(req.body.subCategory || req.body.sub_category || '').trim()
  }
  if (req.body && ('imageUrl' in req.body || 'imageName' in req.body)) {
    next.imageUrl = req.body.imageUrl || ''
    next.imageName = req.body.imageName || ''
  }
  if (!String(next.category || '').trim()) {
    sendError(res, 400, 'Kategori adı zorunlu.')
    return
  }

  db.products[index] = next
  ensureCategoryExists(db, next.category)
  await writeDb(db)
  emitSse({ type: 'product_updated', payload: next })
  res.json({ data: next })
})

app.delete('/api/admin/products/:id', authMiddleware, async (req, res) => {
  const db = await readDb()
  const target = db.products.find((item) => item.id === req.params.id)

  // Cascade: urune ait PDF dosyasini diskten sil
  if (target?.pdfUrl) {
    try {
      const urlPath = new URL(target.pdfUrl).pathname  // /uploads/pdfs/dosya.pdf
      const filePath = path.join(ROOT_DIR, urlPath)
      await fs.unlink(filePath)
    } catch {
      // Dosya zaten yoksa veya URL parse edilemiyorsa sessizce devam et
    }
  }

  db.products = db.products.filter((item) => item.id !== req.params.id)
  await writeDb(db)
  if (target) {
    emitSse({ type: 'product_removed', payload: { id: req.params.id } })
  }
  res.status(204).send()
})

app.get('/api/admin/categories', authMiddleware, async (_req, res) => {
  const db = await readDb()
  const created = ensureCategories(db)
  if (created) {
    await writeDb(db)
  }
  res.json({ data: db.categories })
})

app.post('/api/admin/categories', authMiddleware, async (req, res) => {
  const db = await readDb()
  ensureCategories(db)
  const payload = req.body || {}
  const name = String(payload.name || '').trim()
  const description = String(payload.description || '').trim()
  const subCategories = Array.isArray(payload.subCategories)
    ? payload.subCategories
    : Array.isArray(payload.sub_categories)
      ? payload.sub_categories
      : []
  const normalizedSubs = [...new Set(subCategories.map((item) => String(item || '').trim()).filter(Boolean))]

  if (!name) {
    sendError(res, 400, 'Kategori adı zorunlu.')
    return
  }

  const exists = db.categories.some((item) => normalizeText(item.name) === normalizeText(name))
  if (exists) {
    sendError(res, 409, 'Bu kategori zaten mevcut.')
    return
  }

  const created = {
    id: makeId('cat'),
    name,
    slug: slugify(name),
    subCategories: normalizedSubs,
    description,
  }
  db.categories.push(created)
  await writeDb(db)
  emitSse({ type: 'category_created', payload: created })
  res.status(201).json({ data: created })
})

app.put('/api/admin/categories/:id', authMiddleware, async (req, res) => {
  const db = await readDb()
  ensureCategories(db)
  const index = db.categories.findIndex((item) => item.id === req.params.id)

  if (index < 0) {
    sendError(res, 404, 'Kategori bulunamadı.')
    return
  }

  const payload = req.body || {}
  const name = payload.name !== undefined ? String(payload.name || '').trim() : db.categories[index].name
  const description =
    payload.description !== undefined ? String(payload.description || '').trim() : db.categories[index].description || ''
  const subCategories =
    payload.subCategories !== undefined || payload.sub_categories !== undefined
      ? Array.isArray(payload.subCategories)
        ? payload.subCategories
        : Array.isArray(payload.sub_categories)
          ? payload.sub_categories
          : []
      : db.categories[index].subCategories || []
  const normalizedSubs = [...new Set(subCategories.map((item) => String(item || '').trim()).filter(Boolean))]

  if (!name) {
    sendError(res, 400, 'Kategori adı zorunlu.')
    return
  }

  const exists = db.categories.some(
    (item) => item.id !== req.params.id && normalizeText(item.name) === normalizeText(name),
  )
  if (exists) {
    sendError(res, 409, 'Bu kategori zaten mevcut.')
    return
  }

  const current = db.categories[index]
  const next = { ...current, name, slug: slugify(name), subCategories: normalizedSubs, description }
  db.categories[index] = next

  const updatedProducts = []
  if (normalizeText(current.name) !== normalizeText(name)) {
    db.products = db.products.map((product) => {
      if (normalizeText(product.category) === normalizeText(current.name)) {
        const updated = { ...product, category: name }
        updatedProducts.push(updated)
        return updated
      }
      return product
    })
  }

  await writeDb(db)
  emitSse({ type: 'category_updated', payload: next })
  updatedProducts.forEach((item) => emitSse({ type: 'product_updated', payload: item }))
  res.json({ data: next })
})

app.delete('/api/admin/categories/:id', authMiddleware, async (req, res) => {
  const db = await readDb()
  ensureCategories(db)
  const target = db.categories.find((item) => item.id === req.params.id)

  if (!target) {
    sendError(res, 404, 'Kategori bulunamadı.')
    return
  }

  const hasProducts = db.products.some(
    (product) => normalizeText(product.category) === normalizeText(target.name),
  )
  if (hasProducts) {
    sendError(res, 409, 'Bu kategoriye bağlı ürünler var. Önce ürünleri taşıyın.')
    return
  }

  db.categories = db.categories.filter((item) => item.id !== req.params.id)

  await writeDb(db)
  emitSse({ type: 'category_removed', payload: { id: req.params.id } })
  res.status(204).send()
})

app.get('/api/admin/pricing', authMiddleware, async (_req, res) => {
  const db = await readDb()
  res.json({ data: db.pricing })
})

app.post('/api/admin/pricing', authMiddleware, async (req, res) => {
  const db = await readDb()
  const payload = req.body || {}
  const created = {
    id: makeId('price'),
    plan: payload.plan || 'Unnamed Plan',
    old: toMoney(payload.oldPrice),
    current: toMoney(payload.currentPrice),
    change: toChange(payload.oldPrice, payload.currentPrice),
  }

  db.pricing.push(created)
  await writeDb(db)
  emitSse({ type: 'pricing_created', payload: created })
  res.status(201).json({ data: created })
})

app.put('/api/admin/pricing/:id', authMiddleware, async (req, res) => {
  const db = await readDb()
  const index = db.pricing.findIndex((item) => item.id === req.params.id)

  if (index < 0) {
    sendError(res, 404, 'Fiyat kaydı bulunamadı.')
    return
  }

  const payload = req.body || {}
  const current = db.pricing[index]
  const next = {
    ...current,
    plan: payload.plan ?? current.plan,
    old: payload.oldPrice !== undefined ? toMoney(payload.oldPrice) : current.old,
    current: payload.currentPrice !== undefined ? toMoney(payload.currentPrice) : current.current,
  }

  next.change = toChange(next.old, next.current)
  db.pricing[index] = next
  await writeDb(db)
  emitSse({ type: 'pricing_updated', payload: next })
  res.json({ data: next })
})

app.delete('/api/admin/pricing/:id', authMiddleware, async (req, res) => {
  const db = await readDb()
  const existed = db.pricing.some((item) => item.id === req.params.id)
  db.pricing = db.pricing.filter((item) => item.id !== req.params.id)
  await writeDb(db)
  if (existed) {
    emitSse({ type: 'pricing_removed', payload: { id: req.params.id } })
  }
  res.status(204).send()
})

// --- DUYURU LİSTESİ GETİRME ---
app.get('/api/admin/announcements', authMiddleware, async (_req, res) => {
  try {
    const db = await readDb();
    // Tüm kayıtları 'content' alanına normalize ediyoruz
    const formatted = db.announcements.map(ann => ({
      ...ann,
      content: ann.content || ann.message || ""
    }));
    res.json({ data: formatted });
  } catch (error) {
    sendError(res, 500, 'Hata oluştu.');
  }
});

// --- YENİ DUYURU OLUŞTURMA ---
app.post('/api/admin/announcements', authMiddleware, async (req, res) => {
  try {
    const db = await readDb();
    const payload = req.body || {};

    // Artık sadece 'content' ismini kullanıyoruz
    const created = {
      id: makeId('ann'),
      title: payload.title || 'Başlıksız Duyuru',
      content: String(payload.content || payload.message || ''),
      audience: payload.audience || 'Tüm kullanıcılar',
      state: payload.state || 'Taslak',
      createdAt: new Date().toISOString(),
      publishedAt: payload.state === 'Yayınlandı' ? new Date().toISOString() : null,
    };

    db.announcements.unshift(created);
    await writeDb(db);
    emitSse({ type: 'announcement_created', payload: created });
    res.status(201).json({ data: created });
  } catch (error) {
    sendError(res, 500, 'Hata oluştu.');
  }
});
// --- DUYURU YAYINLAMA ---
app.post('/api/admin/announcements/:id/publish', authMiddleware, async (req, res) => {
  try {
    const db = await readDb();
    const index = db.announcements.findIndex((item) => item.id === req.params.id);

    if (index < 0) {
      sendError(res, 404, 'Duyuru bulunamadı.');
      return;
    }

    db.announcements[index].state = 'Yayınlandı';
    db.announcements[index].publishedAt = new Date().toISOString();
    await writeDb(db);
    emitSse({ type: 'announcement_updated', payload: db.announcements[index] });
    res.json({ data: db.announcements[index] });
  } catch (error) {
    sendError(res, 500, 'Hata oluştu.');
  }
});

// --- DUYURU DUZENLEME ---
app.put('/api/admin/announcements/:id', authMiddleware, async (req, res) => {
  try {
    const db = await readDb();
    const index = db.announcements.findIndex((item) => item.id === req.params.id);

    if (index < 0) {
      sendError(res, 404, 'Duyuru bulunamadı.');
      return;
    }

    const payload = req.body || {};
    const current = db.announcements[index];
    const next = {
      ...current,
      title: payload.title !== undefined ? String(payload.title) : current.title,
      content: payload.content !== undefined ? String(payload.content) : current.content,
      audience: payload.audience !== undefined ? String(payload.audience) : current.audience,
      state: payload.state !== undefined ? String(payload.state) : current.state,
    };

    // Eğer durum Yayınlandı'ya değiştirildiyse ve önceden yayınlanmamışsa zaman damgasını güncelle
    if (next.state === 'Yayınlandı' && !current.publishedAt) {
      next.publishedAt = new Date().toISOString();
    }

    db.announcements[index] = next;
    await writeDb(db);
    emitSse({ type: 'announcement_updated', payload: next });
    res.json({ data: next });
  } catch (error) {
    sendError(res, 500, 'Hata oluştu.');
  }
});

// --- DUYURU SİLME ---
app.delete('/api/admin/announcements/:id', authMiddleware, async (req, res) => {
  try {
    const db = await readDb();
    const existed = db.announcements.some((item) => item.id === req.params.id);
    db.announcements = db.announcements.filter((item) => item.id !== req.params.id);
    await writeDb(db);
    if (existed) {
      emitSse({ type: 'announcement_removed', payload: { id: req.params.id } });
    }
    res.status(204).send();
  } catch (error) {
    sendError(res, 500, 'Hata oluştu.');
  }
});

app.get('/api/admin/users', authMiddleware, async (_req, res) => {
  const db = await readDb()
  res.json({ data: db.users.map(adminUser) })
})

app.post('/api/admin/users', authMiddleware, async (req, res) => {
  const db = await readDb()
  const payload = req.body || {}
  const name = String(payload.name || '').trim()
  const email = String(payload.email || '').trim().toLowerCase()
  const password = String(payload.password || '').trim()
  const role = String(payload.role || 'user').toLowerCase()

  if (!name) {
    sendError(res, 400, 'Kullanıcı adı zorunlu.')
    return
  }

  if (!email) {
    sendError(res, 400, 'E-posta zorunlu.')
    return
  }

  if (!password) {
    sendError(res, 400, 'Şifre zorunlu.')
    return
  }

  if (db.users.some((item) => String(item.email || '').toLowerCase() === email)) {
    sendError(res, 409, 'Bu e-posta zaten kullanılıyor.')
    return
  }

  const created = {
    id: makeId('usr'),
    name,
    email,
    password,
    role,
    createdAt: new Date().toISOString(),
    lastLogin: 'Henüz giriş yapmadı',
  }

  db.users.push(created)
  await writeDb(db)
  res.status(201).json({ data: adminUser(created) })
})

app.patch('/api/admin/users/:id/role', authMiddleware, async (req, res) => {
  const db = await readDb()
  const index = db.users.findIndex((item) => item.id === req.params.id)

  if (index < 0) {
    sendError(res, 404, 'Kullanıcı bulunamadı.')
    return
  }

  const role = String(req.body?.role || 'user').toLowerCase()
  db.users[index].role = role
  await writeDb(db)
  res.json({ data: adminUser(db.users[index]) })
})

app.patch('/api/admin/users/:id/password', authMiddleware, async (req, res) => {
  const db = await readDb()
  const index = db.users.findIndex((item) => item.id === req.params.id)

  if (index < 0) {
    sendError(res, 404, 'Kullanıcı bulunamadı.')
    return
  }

  const password = String(req.body?.password || '').trim()
  if (!password) {
    sendError(res, 400, 'Şifre boş olamaz.')
    return
  }

  db.users[index].password = password
  await writeDb(db)
  res.json({ data: { success: true } })
})

app.delete('/api/admin/users/:id', authMiddleware, async (req, res) => {
  const db = await readDb()
  db.users = db.users.filter((item) => item.id !== req.params.id)
  await writeDb(db)
  res.status(204).send()
})

app.get('/api/announcements/stream', authMiddleware, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const db = await readDb()
  res.write(`data: ${JSON.stringify(db.announcements)}\n\n`)

  sseClients.add(res)

  const heartbeat = setInterval(() => {
    res.write(': ping\n\n')
  }, 25000)

  req.on('close', () => {
    clearInterval(heartbeat)
    sseClients.delete(res)
  })
})

app.get('/api/realtime/stream', authMiddleware, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const db = await readDb()
  const created = ensureCategories(db)
  if (created) {
    await writeDb(db)
  }
  res.write(
    `data: ${JSON.stringify({
      type: 'snapshot',
      payload: {
        products: db.products,
        pricing: db.pricing,
        announcements: db.announcements,
        categories: db.categories || [],
      },
    })}\n\n`,
  )

  sseClients.add(res)

  const heartbeat = setInterval(() => {
    res.write(': ping\n\n')
  }, 25000)

  req.on('close', () => {
    clearInterval(heartbeat)
    sseClients.delete(res)
  })
})

app.use((error, _req, res, _next) => {
  if (error?.message?.includes('Sadece PDF')) {
    res.status(400).json({ message: error.message })
    return
  }

  if (error?.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ message: 'PDF boyutu en fazla 15 MB olabilir.' })
    return
  }

  console.error(error)
  sendError(res, 500, 'Sunucu hatası.')
})

const bootstrap = async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  await fs.mkdir(IMAGE_UPLOAD_DIR, { recursive: true })

  app.listen(PORT, () => {
    console.log(`CRM API listening on http://localhost:${PORT}`)
  })
}

bootstrap().catch((error) => {
  console.error('API başlatılamadı:', error)
  process.exit(1)
})


