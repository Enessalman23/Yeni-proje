import { ArrowUpDown, ChevronLeft, ChevronRight, Download, FileText, Plus, Pencil, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { useOutletContext } from 'react-router-dom'
import { uploadProductImageRequest, uploadProductPdfRequest } from '../../services/api/adminApi'
import { serviceCatalog } from '../../services/catalogData'
import { USE_MOCK_API } from '../../services/api/runtime'
const emptyForm = { name: '', category: '', subCategory: '', status: 'Aktif', pdfUrl: '', pdfName: '', imageUrl: '', imageName: '' }
const normalize = (value) => String(value || '').trim().toLowerCase()
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const MAX_PDF_SIZE_MB = 15
const MAX_PDF_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024
const MAX_IMAGE_SIZE_MB = 5
const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('PDF okunamadı.'))
    reader.readAsDataURL(file)
  })

const AdminProductsPage = () => {
  const {
    products,
    categories,
    addCategory,
    updateCategory,
    removeCategory,
    addProduct,
    updateProduct,
    removeProduct,
  } = useOutletContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [isNewCategory, setIsNewCategory] = useState(false)
  const [isNewSubCategory, setIsNewSubCategory] = useState(false)

  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])

  const modalTitle = useMemo(() => (editingId ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'), [editingId])

  const categoryOptions = useMemo(() => {
    const fromCategories = (categories || []).map((item) => item.name).filter(Boolean)
    if (fromCategories.length > 0) {
      return fromCategories
    }
    return [...new Set(products.map((item) => item.category))].filter(Boolean)
  }, [categories, products])
  const categoryFilterOptions = useMemo(() => ['All', ...categoryOptions], [categoryOptions])
  const statuses = useMemo(() => ['All', ...new Set(products.map((item) => item.status))], [products])

  const getSubcategoryOptions = useCallback((categoryName) => {
    if (!categoryName) return []
    const match = serviceCatalog.find((service) => normalize(service.name) === normalize(categoryName))
    const catalogItems = match?.items || []
    const categoryMeta = (categories || []).find(
      (item) => normalize(item.name) === normalize(categoryName),
    )
    const storedItems = Array.isArray(categoryMeta?.subCategories) ? categoryMeta.subCategories : []
    const dynamicItems = products
      .filter((item) => normalize(item.category) === normalize(categoryName))
      .map((item) => item.subCategory)
      .filter((name) => String(name || '').trim())
    return [...new Set([...catalogItems, ...storedItems, ...dynamicItems])]
  }, [categories, products])

  const subCategoryOptions = useMemo(
    () => getSubcategoryOptions(form.category),
    [form.category, getSubcategoryOptions],
  )

  const [categoryForm, setCategoryForm] = useState({ id: null, name: '', description: '', subCategories: [] })

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return products.filter((item) => {
      const matchesQuery =
        normalized.length === 0 ||
        item.name.toLowerCase().includes(normalized) ||
        item.category.toLowerCase().includes(normalized) ||
        String(item.subCategory || '').toLowerCase().includes(normalized)

      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter

      return matchesQuery && matchesCategory && matchesStatus
    })
  }, [products, query, categoryFilter, statusFilter])

  const sortedProducts = useMemo(() => {
    const next = [...filteredProducts]

    next.sort((a, b) => {
      const left = String(a[sortField]).toLowerCase()
      const right = String(b[sortField]).toLowerCase()
      const compare = left.localeCompare(right, 'tr')
      return sortOrder === 'asc' ? compare : -compare
    })

    return next
  }, [filteredProducts, sortField, sortOrder])

  const pageCount = Math.max(1, Math.ceil(sortedProducts.length / pageSize))
  const currentPage = Math.min(page, pageCount) || 1

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount)
    }
  }, [page, pageCount])

  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedProducts.slice(start, start + pageSize)
  }, [sortedProducts, currentPage, pageSize])

  const openCreateModal = () => {
    setEditingId(null)
    setForm(emptyForm)
    setIsNewCategory(false)
    setIsNewSubCategory(false)
    setIsModalOpen(true)
  }

  const openEditModal = (product) => {
    const nextSubOptions = getSubcategoryOptions(product.category)
    const hasKnownSub =
      product.subCategory &&
      nextSubOptions.some((item) => normalize(item) === normalize(product.subCategory))
    setEditingId(product.id)
    setForm({
      name: product.name,
      category: product.category,
      subCategory: product.subCategory || '',
      status: product.status,
      pdfUrl: product.pdfUrl || '',
      pdfName: product.pdfName || '',
      imageUrl: product.imageUrl || '',
      imageName: product.imageName || '',
    })
    setIsNewCategory(!categoryOptions.includes(product.category))
    setIsNewSubCategory(Boolean(product.subCategory) && !hasKnownSub)
    setIsModalOpen(true)
  }

  const resetCategoryForm = () => {
    setCategoryForm({ id: null, name: '', description: '', subCategories: [] })
  }
  const onSaveCategory = async () => {
    const name = String(categoryForm.name || '').trim()
    const description = String(categoryForm.description || '').trim()
    const subCategories = Array.isArray(categoryForm.subCategories) ? categoryForm.subCategories : []
    const normalizedSubs = [...new Set(subCategories.map((item) => String(item || '').trim()).filter(Boolean))]
    if (!name) {
      toast.error('Kategori adı zorunlu.')
      return
    }

    try {
      if (categoryForm.id) {
        await updateCategory(categoryForm.id, { name, description, subCategories: normalizedSubs })
        toast.success('Kategori güncellendi.')
      } else {
        await addCategory({ name, description, subCategories: normalizedSubs })
        toast.success('Kategori eklendi.')
      }
      resetCategoryForm()
    } catch (error) {
      toast.error(error.message || 'Kategori işlemi başarısız.')
    }
  }

  const onEditCategory = (category) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
      description: category.description || '',
      subCategories: Array.isArray(category.subCategories) ? category.subCategories : [],
    })
  }

  const onRemoveCategory = async (category) => {
    const result = await Swal.fire({
      title: 'Kategori silinsin mi?',
      text: `${category.name} silinecek. Bağlı ürün varsa önce başka kategoriye taşıyın.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sil',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#dc2626',
    })

    if (!result.isConfirmed) return

    try {
      await removeCategory(category.id)
      toast.success('Kategori silindi.')
      if (categoryForm.id === category.id) {
        resetCategoryForm()
      }
    } catch (error) {
      toast.error(error.message || 'Kategori silinemedi.')
    }
  }

  const onFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (file.type !== 'application/pdf') {
      toast.error('Sadece PDF dosyası yükleyebilirsiniz.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_PDF_BYTES) {
      toast.error(`PDF boyutu en fazla ${MAX_PDF_SIZE_MB} MB olabilir.`)
      event.target.value = ''
      return
    }

    try {
      if (USE_MOCK_API) {
        const dataUrl = await readFileAsDataUrl(file)
        setForm((prev) => ({ ...prev, pdfUrl: dataUrl, pdfName: file.name }))
      } else {
        const uploadResult = await uploadProductPdfRequest(file)
        setForm((prev) => ({
          ...prev,
          pdfUrl: uploadResult.pdfUrl || '',
          pdfName: uploadResult.pdfName || file.name,
        }))
      }
    } catch (error) {
      toast.error(error.message || 'PDF yüklenemedi.')
    } finally {
      event.target.value = ''
    }
  }

  const onImageChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!String(file.type || '').startsWith('image/')) {
      toast.error('Sadece gorsel dosyasi yukleyebilirsiniz.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(`Gorsel boyutu en fazla ${MAX_IMAGE_SIZE_MB} MB olabilir.`)
      event.target.value = ''
      return
    }

    try {
      if (USE_MOCK_API) {
        const dataUrl = await readFileAsDataUrl(file)
        setForm((prev) => ({ ...prev, imageUrl: dataUrl, imageName: file.name }))
      } else {
        const uploadResult = await uploadProductImageRequest(file)
        setForm((prev) => ({
          ...prev,
          imageUrl: uploadResult.imageUrl || '',
          imageName: uploadResult.imageName || file.name,
        }))
      }
    } catch (error) {
      toast.error(error.message || 'Gorsel yuklenemedi.')
    } finally {
      event.target.value = ''
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    if (!form.name.trim()) {
      toast.error('Ürün adı zorunlu.')
      return
    }
    if (!form.category.trim()) {
      toast.error('Kategori zorunlu.')
      return
    }

    try {
      if (isNewCategory) {
        const exists = categoryOptions.some(
          (item) => item.toLowerCase() === form.category.trim().toLowerCase(),
        )
        if (!exists) {
          await addCategory({ name: form.category.trim(), description: '' })
        }
      }

      if (editingId) {
        await updateProduct(editingId, form)
        toast.success('Ürün güncellendi.')
      } else {
        await addProduct(form)
        toast.success('Ürün eklendi.')
      }

      setIsModalOpen(false)
    } catch (error) {
      toast.error(error.message || 'Ürün işlemi başarısız.')
    }
  }

  const onRemove = async (id, name) => {
    const result = await Swal.fire({
      title: 'Ürün silinsin mi?',
      text: `${name} listeden kaldırılacak.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sil',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#dc2626',
    })

    if (result.isConfirmed) {
      try {
        await removeProduct(id)
        toast.success('Ürün kaldırıldı.')
      } catch (error) {
        toast.error(error.message || 'Ürün silinemedi.')
      }
    }
  }

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortField(field)
    setSortOrder('asc')
  }

  const exportCsv = () => {
    if (sortedProducts.length === 0) {
      toast.error('Dışa aktarılacak veri yok.')
      return
    }

    const rows = [
      ['Ürün', 'Kategori', 'Alt Kategori', 'Durum', 'PDF'],
      ...sortedProducts.map((item) => [item.name, item.category, item.subCategory || '-', item.status, item.pdfName || '-']),
    ]
    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
          .join(';'),
      )
      .join('\r\n')
    const bom = '\uFEFF'

    const blob = new Blob([`${bom}${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Ürünler.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-slate-900">Ürün Yönetimi</h1>

      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Kategori Yönetimi</h2>
            {/* <p className="text-xs text-slate-500">Kategori ekle, düzenle veya sil.</p> */}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={categoryForm.name}
              onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Kategori adı"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm md:max-w-lg"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSaveCategory}
                className="rounded-lg bg-primary px-3  py-2 text-[15px] font-semibold text-white cursor-pointer"
              >
                {categoryForm.id ? 'Güncelle' : 'Ekle'}
              </button>
              {categoryForm.id && (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"
                >
                  Vazgeç
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {categories.length === 0 ? (
            <p className="px-4 py-3 text-xs text-slate-500">Henüz kategori yok.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {categories.map((category) => (
                <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{category.name}</p>
                    {category.description && (
                      <p className="text-xs text-slate-500">{category.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditCategory(category)}
                      className="rounded-md border border-amber-300 px-2.5 py-1.5 text-[15px] cursor-pointer font-semibold text-amber-700"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveCategory(category)}
                      className="rounded-md border border-red-300 px-2.5 py-1.5 text-[15px] cursor-pointer font-semibold text-red-700"
                    >
                      Sil
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex items-end justify-end gap-2">
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px]  cursor-pointer font-semibold text-slate-700"
        >
          <Download size={15} /> CSV
        </button>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[15px]  cursor-pointer font-semibold text-white"
        >
          <Plus size={16} /> Ürün Ekle
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1.3fr_1fr_1fr]">
        <label className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Ürün veya kategori ara..."
            className="w-full rounded-lg border border-slate-300 px-9 py-2 text-sm"
          />
        </label>

        <select
          value={categoryFilter}
          onChange={(event) => {
            setCategoryFilter(event.target.value)
            setPage(1)
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {categoryFilterOptions.map((item) => (
            <option key={item} value={item}>
              {item === 'All' ? 'Tüm kategoriler' : item}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value)
            setPage(1)
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item === 'All' ? 'Tüm durumlar' : item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-4 py-3">
                <button type="button" onClick={() => toggleSort('name')} className="inline-flex items-center gap-1">
                  Ürün <ArrowUpDown size={13} />
                </button>
              </th>
              <th className="px-4 py-3">
                <button type="button" onClick={() => toggleSort('category')} className="inline-flex items-center gap-1">
                  Kategori <ArrowUpDown size={13} />
                </button>
              </th>
              <th className="px-4 py-3">
                <button type="button" onClick={() => toggleSort('subCategory')} className="inline-flex items-center gap-1">
                  Alt Kategori <ArrowUpDown size={13} />
                </button>
              </th>
              <th className="px-4 py-3">
                <button type="button" onClick={() => toggleSort('status')} className="inline-flex items-center gap-1">
                  Durum <ArrowUpDown size={13} />
                </button>
              </th>
              <th className="px-4 py-3">PDF</th>
              <th className="px-4 py-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {pagedProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                  Filtreye uygun kayıt bulunamadı.
                </td>
              </tr>
            )}
            {pagedProducts.map((product) => (
              <tr key={product.id} className="border-t border-slate-200 even:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800">{product.name}</td>
                <td className="px-4 py-3 text-slate-600">{product.category}</td>
                <td className="px-4 py-3 text-slate-600">{product.subCategory || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{product.status}</td>
                <td className="px-4 py-3 text-slate-600">{product.pdfName ? product.pdfName : 'PDF yok'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 ">
                    <button
                      type="button"
                      onClick={() => openEditModal(product)}
                      className="inline-flex items-center  gap-0.5 rounded-md bg-amber-500 px-3 py-1.5 text-[15px] cursor-pointer font-bold text-white"
                    >
                      <Pencil size={12} /> Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(product.id, product.name)}
                      className="inline-flex items-center  gap-1 rounded-md bg-red-600 px-3 py-1.5 text-[15px] cursor-pointer font-bold text-white"
                    >
                      <Trash2 size={12} /> Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-slate-500">
          Toplam {sortedProducts.length} kayıt, sayfa {currentPage}/{pageCount}
        </p>
        <label className="flex items-center gap-2 text-slate-500">
          <span>Sayfa başına</span>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(1)
            }}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Önceki
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
            disabled={currentPage === pageCount}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            Sonraki <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="font-display text-xl font-bold text-slate-900">{modalTitle}</h2>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Ürün adı"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={isNewCategory ? '__new__' : form.category}
                onChange={(event) => {
                  const value = event.target.value
                  if (value === '__new__') {
                    setIsNewCategory(true)
                    setIsNewSubCategory(true)
                    setForm((prev) => ({ ...prev, category: '', subCategory: '' }))
                    return
                  }
                  const nextSubOptions = getSubcategoryOptions(value)
                  setIsNewCategory(false)
                  setIsNewSubCategory(nextSubOptions.length === 0)
                  setForm((prev) => ({ ...prev, category: value, subCategory: '' }))
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Kategori seçin
                </option>
                {categoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
                <option value="__new__">Yeni kategori...</option>
              </select>
              {isNewCategory && (
                <input
                  type="text"
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  placeholder="Yeni kategori yazın"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              )}
              {!isNewCategory && subCategoryOptions.length > 0 && (
                <select
                  value={isNewSubCategory ? '__new__' : form.subCategory}
                  onChange={(event) => {
                    const value = event.target.value
                    if (value === '__new__') {
                      setIsNewSubCategory(true)
                      setForm((prev) => ({ ...prev, subCategory: '' }))
                      return
                    }
                    setIsNewSubCategory(false)
                    setForm((prev) => ({ ...prev, subCategory: value }))
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Alt kategori seçin</option>
                  {subCategoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value="__new__">Yeni alt kategori...</option>
                </select>
              )}
              {(isNewCategory || isNewSubCategory || subCategoryOptions.length === 0) && (
                <input
                  type="text"
                  value={form.subCategory}
                  onChange={(event) => setForm((prev) => ({ ...prev, subCategory: event.target.value }))}
                  placeholder="Alt kategori (opsiyonel)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              )}
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option>Aktif</option>
                <option>Taslak</option>
                <option>Pasif</option>
              </select>
              <div className="rounded-lg border border-slate-300 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ürün Görseli</p>
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                  Görsel Seç
                  <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
                </label>

                {form.imageUrl ? (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={form.imageUrl}
                        alt={form.imageName || 'Urun gorseli'}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <p className="truncate text-xs text-slate-600">{form.imageName || 'Gorsel'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, imageUrl: '', imageName: '' }))}
                      className="rounded-md border border-red-300 px-2 py-1 text-[11px] font-semibold text-red-700"
                    >
                      Gorseli Kaldır
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">Bu ürün için henüz görsel yok.</p>
                )}
              </div>
              <div className="rounded-lg border border-slate-300 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">PDF Dokümanı</p>
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                  <FileText size={14} />
                  PDF Seç
                  <input type="file" accept="application/pdf" onChange={onFileChange} className="hidden" />
                </label>

                {form.pdfName ? (
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-slate-600">{form.pdfName}</p>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, pdfUrl: '', pdfName: '' }))}
                      className="rounded-md border border-red-300 px-2 py-1 text-[11px] cursor-pointer font-semibold text-red-700"
                    >
                      PDF Kaldır
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">Bu ürün için henüz PDF atanmadı.</p>
                )}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold cursor-pointer">
                İptal
              </button>
              <button type="submit" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold cursor-pointer text-white">
                Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminProductsPage

