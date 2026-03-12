import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { useOutletContext } from 'react-router-dom'

const emptyForm = { plan: '', old: '', current: '' }
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const extractNumber = (value) => String(value).replace(/[^0-9.,]/g, '').replace(',', '.')

const AdminPricingPage = () => {
  const { pricingRows, addPricing, updatePricing, removePricing } = useOutletContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [query, setQuery] = useState('')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const filteredPricingRows = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return pricingRows

    return pricingRows.filter((row) => {
      const plan = String(row.plan || '').toLowerCase()
      const oldValue = String(row.old || '').toLowerCase()
      const currentValue = String(row.current || '').toLowerCase()
      const changeValue = String(row.change || '').toLowerCase()
      return (
        plan.includes(normalized) ||
        oldValue.includes(normalized) ||
        currentValue.includes(normalized) ||
        changeValue.includes(normalized)
      )
    })
  }, [pricingRows, query])

  const pageCount = Math.max(1, Math.ceil(filteredPricingRows.length / pageSize))
  const currentPage = Math.min(page, pageCount) || 1
  const pagedPricingRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPricingRows.slice(start, start + pageSize)
  }, [filteredPricingRows, currentPage, pageSize])

  const modalTitle = useMemo(() => (editingId ? 'Fiyat Duzenle' : 'Yeni Fiyat Ekle'), [editingId])

  const openCreateModal = () => {
    setEditingId(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }

  const openEditModal = (row) => {
    setEditingId(row.id)
    setForm({
      plan: row.plan,
      old: extractNumber(row.old),
      current: extractNumber(row.current),
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    if (!form.plan.trim() || !form.old || !form.current) {
      toast.error('Tum alanlari doldurun.')
      return
    }

    try {
      if (editingId) {
        await updatePricing(editingId, form)
        toast.success('Fiyat satiri guncellendi.')
      } else {
        await addPricing(form)
        toast.success('Fiyat satiri eklendi.')
      }

      setIsModalOpen(false)
    } catch (error) {
      toast.error(error.message || 'Fiyat islemi basarisiz.')
    }
  }

  const onRemove = async (id, plan) => {
    const result = await Swal.fire({
      title: 'Fiyat satiri silinsin mi?',
      text: `${plan} kaydi kaldirilacak.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sil',
      cancelButtonText: 'Iptal',
      confirmButtonColor: '#dc2626',
    })

    if (result.isConfirmed) {
      try {
        await removePricing(id)
        toast.success('Fiyat satiri kaldirildi.')
      } catch (error) {
        toast.error(error.message || 'Fiyat satiri silinemedi.')
      }
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Fiyat Yönetimi</h1>
          <p className="mt-1 text-sm text-slate-500">Canlı fiyat satırları bu panelden yönetilir.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> Fiyat Ekle
        </button>
      </div>

      <div className="mt-4">
        <label className="relative block">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Plan veya fiyat ara..."
            className="w-full rounded-lg border border-slate-300 px-9 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 space-y-3">
        {pagedPricingRows.length === 0 ? (
          <div className="py-10 text-center text-slate-400">Henüz fiyat kaydı bulunmuyor.</div>
        ) : (
          pagedPricingRows.map((row) => (
            <article key={row.id} className="grid gap-2 rounded-xl border border-slate-200 p-4 sm:grid-cols-5 sm:items-center">
              <p className="font-semibold text-slate-900">{row.plan}</p>
              <p className="text-sm text-slate-600">Eski: {row.old}</p>
              <p className="text-sm text-slate-600">Yeni: {row.current}</p>
              <p className="text-sm font-bold text-emerald-700">{row.change}</p>
              <div className="flex gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => openEditModal(row)}
                  className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1.5 text-xs font-bold text-white"
                >
                  <Pencil size={12} /> Duzenle
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(row.id, row.plan)}
                  className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white"
                >
                  <Trash2 size={12} /> Sil
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-slate-500">
          Toplam {filteredPricingRows.length}/{pricingRows.length} kayıt, sayfa {currentPage}/{pageCount}
        </p>
        <label className="flex items-center gap-2 text-slate-500">
          <span>Sayfa basina</span>
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
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Önceki
          </button>
          <button
            type="button"
            onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
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
                value={form.plan}
                onChange={(event) => setForm((prev) => ({ ...prev, plan: event.target.value }))}
                placeholder="Paket adi"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.old}
                onChange={(event) => setForm((prev) => ({ ...prev, old: event.target.value }))}
                placeholder="Eski fiyat"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.current}
                onChange={(event) => setForm((prev) => ({ ...prev, current: event.target.value }))}
                placeholder="Yeni fiyat"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">
                Iptal
              </button>
              <button type="submit" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">
                Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminPricingPage


