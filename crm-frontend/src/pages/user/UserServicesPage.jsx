import { ArrowLeft, ExternalLink, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serviceCatalog } from '../../services/catalogData'
import { useAppData } from '../../context/AppDataContext'

const normalize = (v) => String(v || '').trim().toLowerCase()
const PAGE_SIZE_OPTIONS = [6, 12, 18, 24, 30]
const slugify = (value) =>
  normalize(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

// Relative path'i tam URL'e donusturur
const resolvePdfUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/pdfs/')) return url
  // 'uploads/pdfs/...' gibi backend relative path'leri resolve et
  const clean = url.startsWith('/') ? url : `/${url}`
  return `http://localhost:8080${clean}`
}

const UserServicesPage = () => {
  const { serviceId, productId } = useParams()
  const { products, categories } = useAppData()
  const navigate = useNavigate()
  const [isPdfOpen, setIsPdfOpen] = useState(false)
  const [pdfProduct, setPdfProduct] = useState(null)
  const [subPage, setSubPage] = useState(1)
  const [subPageSize, setSubPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [categoryPage, setCategoryPage] = useState(1)
  const [categoryPageSize, setCategoryPageSize] = useState(PAGE_SIZE_OPTIONS[0])

  // Bireysel ürünü bul (productId varsa)
  const selectedProduct = useMemo(() => {
    if (!productId) return null
    const normalizedId = normalize(productId)
    return (
      products.find(
        (p) =>
          normalize(p.id) === normalizedId ||
          normalize(p.slug) === normalizedId ||
          slugify(p.name) === normalizedId,
      ) || null
    )
  }, [productId, products])

  // Aktif kategori
  const selectedCategory = useMemo(() => {
    if (!serviceId) return serviceCatalog[0]

    const catalogMatch = serviceCatalog.find(
      (s) =>
        normalize(s.id) === normalize(serviceId) ||
        normalize(s.name) === normalize(serviceId) ||
        slugify(s.name) === normalize(serviceId),
    )

    const categoryMatch = (categories || []).find(
      (c) =>
        normalize(c.id) === normalize(serviceId) ||
        normalize(c.slug) === normalize(serviceId) ||
        normalize(c.name) === normalize(serviceId) ||
        slugify(c.name) === normalize(serviceId),
    )

    if (catalogMatch) return catalogMatch

    if (categoryMatch) {
      const fallbackProducts = products.filter(
        (p) => normalize(p.category) === normalize(categoryMatch.name),
      )
      return {
        id: slugify(categoryMatch.name) || `kategori-${String(serviceId || 'yeni')}`,
        name: categoryMatch.name,
        description: categoryMatch.description || '',
        longDescription: [],
        pdfUrl: '',
        heroImage: serviceCatalog[0]?.heroImage || '',
        items: fallbackProducts.map((p) => p.name),
      }
    }

    const fallbackName = selectedProduct?.category || serviceId
    const fallbackProducts = products.filter(
      (p) => normalize(p.category) === normalize(fallbackName),
    )

    return {
      id: slugify(fallbackName) || `kategori-${String(serviceId || 'yeni')}`,
      name: selectedProduct?.category || fallbackName,
      description: '',
      longDescription: [],
      pdfUrl: '',
      heroImage: serviceCatalog[0]?.heroImage || '',
      items: fallbackProducts.map((p) => p.name),
    }
  }, [serviceId, categories, selectedProduct, products])

  const virtualProduct = useMemo(() => {
    if (!productId || selectedProduct) return null
    const normalizedId = normalize(productId).replace(/^sub-/, '')

    const subFromProducts = products
      .map((p) => p.subCategory)
      .filter(Boolean)
      .find((name) => normalize(name) === normalizedId || slugify(name) === normalizedId)

    const subFromCatalog = (selectedCategory?.items || []).find(
      (name) => normalize(name) === normalizedId || slugify(name) === normalizedId,
    )

    const resolvedName = subFromProducts || subFromCatalog || null
    if (!resolvedName) return null

    return {
      id: `sub-${slugify(resolvedName) || normalizedId}`,
      name: resolvedName,
      category: selectedCategory?.name || '',
      subCategory: '',
      pdfUrl: '',
      pdfName: '',
    }
  }, [productId, selectedProduct, products, selectedCategory])

  const resolvedProduct = selectedProduct || virtualProduct

  // PDF kaynağı - tam URL'e resolve et
  const pdfSource = useMemo(() => {
    const raw = pdfProduct?.pdfUrl || selectedProduct?.pdfUrl || selectedCategory?.pdfUrl || null
    return resolvePdfUrl(raw)
  }, [pdfProduct, selectedProduct, selectedCategory])

  const categoryProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          normalize(p.category) === normalize(selectedCategory?.name) &&
          !String(p.subCategory || '').trim(),
      ),
    [products, selectedCategory],
  )

  const categorySubGroups = useMemo(() => {
    const names = products
      .filter((p) => normalize(p.category) === normalize(selectedCategory?.name))
      .map((p) => p.subCategory)
      .filter((name) => String(name || '').trim())
    const stored = Array.isArray(selectedCategory?.subCategories)
      ? selectedCategory.subCategories
      : []
    return [...new Set([...names, ...stored])]
  }, [products, selectedCategory])

  // Sayfa modları: 'product' (bireysel) veya 'category' (genel)
  const isProductMode = Boolean(resolvedProduct)

  const subCategoryProducts = useMemo(() => {
    if (!resolvedProduct) return []
    return products.filter(
      (p) =>
        normalize(p.category) === normalize(selectedCategory?.name) &&
        normalize(p.subCategory) === normalize(resolvedProduct.name),
    )
  }, [products, selectedCategory, resolvedProduct])

  const hasSubCategoryProducts = subCategoryProducts.length > 0
  const subPageCount = Math.max(1, Math.ceil(subCategoryProducts.length / subPageSize))
  const currentSubPage = Math.min(subPage, subPageCount) || 1
  const pagedSubCategoryProducts = useMemo(() => {
    const start = (currentSubPage - 1) * subPageSize
    return subCategoryProducts.slice(start, start + subPageSize)
  }, [subCategoryProducts, currentSubPage, subPageSize])

  const categoryEntries = useMemo(() => {
    const hasBaseProducts = categoryProducts.length > 0
    const hasSubGroups = categorySubGroups.length > 0
    const baseEntries = hasBaseProducts
      ? categoryProducts.map((product) => ({ name: product.name, id: product.id }))
      : !hasSubGroups
        ? selectedCategory.items.map((itemName) => ({ name: itemName, id: null }))
        : []

    const subEntries = categorySubGroups
      .filter(
        (name) => !categoryProducts.some((product) => normalize(product.name) === normalize(name)),
      )
      .map((name) => ({ name, id: slugify(name) }))

    return baseEntries.concat(subEntries)
  }, [categoryProducts, selectedCategory.items, categorySubGroups])
  const categoryPageCount = Math.max(1, Math.ceil(categoryEntries.length / categoryPageSize))
  const currentCategoryPage = Math.min(categoryPage, categoryPageCount) || 1
  const pagedCategoryEntries = useMemo(() => {
    const start = (currentCategoryPage - 1) * categoryPageSize
    return categoryEntries.slice(start, start + categoryPageSize)
  }, [categoryEntries, currentCategoryPage, categoryPageSize])

  const productName = resolvedProduct?.name || selectedCategory?.name || ''
  const productCategoryName = selectedCategory?.name || resolvedProduct?.category || ''

  return (
    <div className="min-h-[80vh] pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={selectedCategory.heroImage}
          alt={selectedCategory.name}
          className="h-72 w-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8">
          {/* Geri butonu (bireysel ürün modunda) */}
          {isProductMode && (
            <button
              type="button"
              onClick={() => navigate(`/user/services/${serviceId}`)}
              className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
            >
              <ArrowLeft size={13} /> {selectedCategory.name}
            </button>
          )}

          <h1 className="font-display text-3xl font-extrabold text-white drop-shadow sm:text-4xl">
            {isProductMode ? resolvedProduct.name : selectedCategory.name}
          </h1>

          {!isProductMode && (
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-white/80">
              {selectedCategory.description}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-10 px-6 pt-10">
        {isProductMode ? (
          /* --- BİREYSEL ÜRÜN SAYFASI --- */
          <div className="space-y-8">
            {/* Açıklama kartları */}
            <div className="rounded-3xl border border-slate-200/70 bg-linear-to-br from-white via-white to-slate-50 p-6 shadow-sm">
              <div className="rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-slate-200/70">
                <p className="text-[15px] font-black  tracking-widest text-primary">Hizmet Hakkında</p>
                <div className="mt-4 flex items-start gap-4">
                  <p className="leading-relaxed text-slate-700">
                    {hasSubCategoryProducts
                      ? `${resolvedProduct.name} için cihaz modelleri aşağıda listelenir. İlgili cihaza tıklayarak PDF dokümanına ulaşabilirsiniz.`
                      : `${productName} hizmeti ${productCategoryName} kategorisinde sunulur. ${selectedCategory.description || 'Hizmet detayları ve ilgili dökümanlar bu sayfada listelenir.'}`}
                  </p>
                </div>
              </div>
            </div>

            {hasSubCategoryProducts ? (
              <div className="space-y-3">
                <p className="text-[20px] font-black  tracking-[0.15em] text-slate-600">
                  {resolvedProduct.name} Modelleri
                </p>
                {subCategoryProducts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                    Bu kategori için henüz cihaz eklenmedi.
                  </div>
                ) : (
                  <>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {pagedSubCategoryProducts.map((product, idx) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setPdfProduct(product)
                            setIsPdfOpen(true)
                          }}
                          className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1.5"
                        >
                          {/* Üst Bar: Numara ve PDF Rozeti */}
                          <div className="mb-2 flex items-center justify-between">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-500 transition-all group-hover:bg-primary group-hover:text-white">
                              {idx + 1}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-primary transition-all group-hover:bg-primary group-hover:text-white">
                              PDF <ExternalLink size={12} />
                            </span>
                          </div>

                          {/* Görsel Alanı */}
                          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50/50 p-4">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                {/* İkon gelebilir */}
                              </div>
                            )}
                          </div>

                          {/* Ürün Metni */}
                          <div className="mt-4 px-1 pb-2 text-center">
                            <span className="block truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-primary">
                              {product.name}
                            </span>
                            <span className="mt-1 block text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                              {product.subCategory || 'Kurumsal Çözüm'}
                            </span>
                          </div>

                          {/* Alt Dekoratif Çizgi */}
                          <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap text-[15px] items-center justify-between gap-3 pt-2 text-sm text-slate-500">
                      <span>Toplam {subCategoryProducts.length} ürün, sayfa {currentSubPage}/{subPageCount}</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={subPageSize}
                          onChange={(event) => {
                            setSubPageSize(Number(event.target.value))
                            setSubPage(1)
                          }}
                          className="rounded-lg border border-slate-600 px-2 py-1 text-sm"
                        >
                          {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setSubPage(Math.max(1, currentSubPage - 1))}
                          disabled={currentSubPage === 1}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
                        >
                          Önceki
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubPage(Math.min(subPageCount, currentSubPage + 1))}
                          disabled={currentSubPage === subPageCount}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
                        >
                          Sonraki
                        </button>
                      </div>
                    </div>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => navigate(`/user/services/${serviceId}`)}
                  className="text-[17px] font-semibold text-slate-400 hover:text-slate-700 transition"
                >
                  ‹ Kategoriye Dön
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setPdfProduct(null)
                    setIsPdfOpen(true)
                  }}
                  disabled={!pdfSource}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Dökümana Bak <ExternalLink size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/user/services/${serviceId}`)}
                  className="text-sm font-semibold text-slate-400 hover:text-slate-700 transition"
                >
                  ‹ Kategoriye Dön
                </button>
              </div>
            )}
          </div>
        ) : (
          /* --- KATEGORİ SAYFASI --- */
          <div className="space-y-10">
            {/* Uzun açıklama */}
            <div className="grid gap-6 grid-cols-2">
              {selectedCategory.longDescription?.map((para, i) => (
                <div key={i} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <p className="leading-relaxed text-slate-700">{para}</p>
                </div>
              ))}
            </div>

            {/* Bu Kategorideki Hizmetler — ürün kartları */}
            <div>
              <p className="mb-4 text-[15px]  font-black  tracking-[0.15em] text-slate-600">
                Bu Kategorideki Hizmetler
              </p>
              <div className="grid gap-3 grid-cols-3">
                {pagedCategoryEntries.map((entry, idx) => {
                  const productId =
                    entry.id ||
                    products.find(
                      (p) =>
                        normalize(p.category) === normalize(selectedCategory.name) &&
                        normalize(p.name) === normalize(entry.name) &&
                        !String(p.subCategory || '').trim(),
                    )?.id
                  const targetId = productId || entry.id
                  return (
                    <button
                      key={`${entry.name}-${idx}`}
                      type="button"
                      onClick={() =>
                        navigate(
                          targetId
                            ? `/user/services/${serviceId}/${targetId}`
                            : `/user/services/${serviceId}`,
                        )
                      }
                      className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-black text-primary transition group-hover:bg-primary group-hover:text-white">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 group-hover:text-primary transition text-sm">
                        {entry.name}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                <span>Toplam {categoryEntries.length} hizmet, sayfa {currentCategoryPage}/{categoryPageCount}</span>
                <div className="flex items-center gap-2">
                  <select
                    value={categoryPageSize}
                    onChange={(event) => {
                      setCategoryPageSize(Number(event.target.value))
                      setCategoryPage(1)
                    }}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setCategoryPage(Math.max(1, currentCategoryPage - 1))}
                    disabled={currentCategoryPage === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
                  >
                    Önceki
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryPage(Math.min(categoryPageCount, currentCategoryPage + 1))}
                    disabled={currentCategoryPage === categoryPageCount}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            </div>

            {/* PDF butonu */}
            {pdfSource && (
              <div>
                <button
                  type="button"
                  onClick={() => setIsPdfOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:-translate-y-0.5"
                >
                  Kategori Dökümanı <ExternalLink size={15} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PDF Modal */}
      {isPdfOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 p-4 sm:p-8 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h2 className="font-display text-base font-bold text-slate-900">
                {(pdfProduct || (isProductMode ? resolvedProduct : selectedCategory))?.name} - PDF Dökümanı
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsPdfOpen(false)
                  setPdfProduct(null)
                }}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>
            <iframe title="PDF" src={pdfSource} className="h-full w-full" />
          </div>
        </div>
      )}
    </div>
  )
}

export default UserServicesPage
