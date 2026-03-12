import { Pencil, Plus, Send, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { useOutletContext } from 'react-router-dom'

const emptyForm = { title: '', content: '', audience: 'Tüm kullanıcılar', state: 'Taslak' }
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const AdminAnnouncementsPage = () => {
  const { announcements, addAnnouncement, updateAnnouncement, publishAnnouncement, removeAnnouncement } = useOutletContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const pageCount = Math.max(1, Math.ceil(announcements.length / pageSize))
  const currentPage = Math.min(page, pageCount) || 1
  const pagedAnnouncements = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return announcements.slice(start, start + pageSize)
  }, [announcements, currentPage, pageSize])

  const modalTitle = editingId ? 'Duyuruyu Duzenle' : 'Yeni Duyuru Olustur'

  const openCreateModal = () => {
    setEditingId(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      content: item.content || '',
      audience: item.audience,
      state: item.state,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Duyuru basligi ve icerigi zorunludur.')
      return
    }

    try {
      if (editingId) {
        await updateAnnouncement(editingId, form)
        toast.success('Duyuru guncellendi.')
      } else {
        await addAnnouncement(form)
        toast.success('Duyuru olusturuldu.')
      }
      closeModal()
    } catch (error) {
      toast.error(error.message || 'Duyuru islemi basarisiz.')
    }
  }

  const onPublish = async (id, title) => {
    const result = await Swal.fire({
      title: 'Duyuru yayınlansın mı?',
      text: `"${title}" başlıklı duyuru hedef kitleye gönderilecek.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Evet, Yayınla',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#0047AB',
    })

    if (result.isConfirmed) {
      try {
        await publishAnnouncement(id)
        toast.success('Duyuru yayına alındı.')
      } catch (error) {
        toast.error(error.message || 'Duyuru yayınlanamadı.')
      }
    }
  }

  const onRemove = async (id) => {
    const result = await Swal.fire({
      title: 'Duyuruyu silmek istediğinize emin misiniz?',
      text: 'Bu islem geri alınamaz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sil',
      cancelButtonText: 'Vazgeç',
      confirmButtonColor: '#dc2626',
    })

    if (result.isConfirmed) {
      try {
        await removeAnnouncement(id)
        toast.success('Duyuru silindi.')
      } catch (error) {
        toast.error(error.message || 'Duyuru silinemedi.')
      }
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Duyuru Merkezi</h1>
          <p className="text-sm text-slate-500">Kullanıcılara anlık bildirimler ve duyurular gönderin.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90"
        >
          <Plus size={18} /> Duyuru Oluştur
        </button>
      </div>

      {/* List */}
      <div className="mt-6 grid gap-4 overflow-hidden">
        {pagedAnnouncements.length === 0 ? (
          <div className="py-10 text-center text-slate-400">Henüz bir duyuru bulunmuyor.</div>
        ) : (
          pagedAnnouncements.map((item) => (
            <article key={item.id} className="group relative min-w-0 overflow-hidden rounded-xl border border-slate-200 p-5 transition-all hover:border-primary/30 hover:shadow-md">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-bold text-slate-900">{item.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.state === 'Yayınlandı' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                  >
                    {item.state}
                  </span>
                </div>

                <p
                  className="mt-2 overflow-hidden text-sm leading-relaxed text-slate-600"
                  style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
                >
                  {item.content || item.message || <span className="italic text-red-400">İçerik bulunamadı</span>}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                  <span className="text-xs italic text-slate-400">Hedef: {item.audience}</span>
                  <div className="flex gap-2">
                    {/* Düzenle butonu - her durumda görünür */}
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-amber-600"
                    >
                      <Pencil size={12} /> Düzenle
                    </button>

                    {item.state !== 'Yayınlandı' && (
                      <button
                        type="button"
                        onClick={() => onPublish(item.id, item.title)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                      >
                        <Send size={14} /> Yayınla
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                    >
                      <Trash2 size={14} /> Sil
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm ">
        <p className="text-slate-500">
          Toplam {announcements.length} kayıt, Sayfa {currentPage}/{pageCount}
        </p>
        <label className="flex items-center gap-2  text-slate-500">
          <span>Sayfa başına</span>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(1)
            }}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm "
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

      {/* Modal - hem ekle hem düzenle */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-lg animate-in fade-in zoom-in rounded-2xl bg-white p-6 shadow-2xl duration-200"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-display text-xl font-bold text-slate-900">{modalTitle}</h2>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Baslik</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Duyuru başlığı..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Duyuru İçeriği</label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Duyuru detaylarini buraya yazın..."
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Hedef Kitle</label>
                  <select
                    value={form.audience}
                    onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                  >
                    <option>Tüm kullanıcılar</option>
                    <option>Sistemde kayıtlı olanlar</option>
                    <option>Sisteme yeni kayıt olanlar</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Durum</label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                  >
                    <option>Taslak</option>
                    <option>Planlandi</option>
                    <option>Yayınlandı</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
              >
                Iptal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
              >
                {editingId ? 'Guncelle' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminAnnouncementsPage


