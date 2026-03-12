import { KeyRound, Plus, Trash2, X, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { useOutletContext } from 'react-router-dom'

const emptyForm = { name: '', email: '', password: '', role: 'user' }
const emptyPwForm = { newPassword: '', confirm: '' }
const PAGE_SIZE = 10

const AdminUsersPage = () => {
  const { users, addUser, updateUserRole, updateUserPassword, removeUser } = useOutletContext()

  // Kullanici ekleme modali
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  // Sifre degistirme modali
  const [pwUserId, setPwUserId] = useState(null)
  const [pwUserName, setPwUserName] = useState('')
  const [pwForm, setPwForm] = useState(emptyPwForm)

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return users

    return users.filter((user) => {
      const name = String(user.name || '').toLowerCase()
      const email = String(user.email || '').toLowerCase()
      const role = String(user.role || '').toLowerCase()
      const lastLogin = String(user.lastLogin || '').toLowerCase()
      return (
        name.includes(normalized) ||
        email.includes(normalized) ||
        role.includes(normalized) ||
        lastLogin.includes(normalized)
      )
    })
  }, [users, query])

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount) || 1
  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredUsers.slice(start, start + PAGE_SIZE)
  }, [filteredUsers, currentPage])

  const openAddModal = () => {
    setForm(emptyForm)
    setIsAddOpen(true)
  }

  const openPwModal = (user) => {
    setPwUserId(user.id)
    setPwUserName(user.name)
    setPwForm(emptyPwForm)
  }

  const closePwModal = () => {
    setPwUserId(null)
    setPwUserName('')
    setPwForm(emptyPwForm)
  }

  const onAddSubmit = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) { toast.error('Kullanıcı adı zorunlu.'); return }
    if (!form.email.trim()) { toast.error('E-posta zorunlu.'); return }
    if (!form.password.trim()) { toast.error('Şifre zorunlu.'); return }

    try {
      await addUser(form)
      toast.success('Kullanıcı eklendi.')
      setForm(emptyForm)
      setIsAddOpen(false)
    } catch (error) {
      toast.error(error.message || 'Kullanıcı eklenemedi.')
    }
  }

  const onPwSubmit = async (event) => {
    event.preventDefault()
    if (!pwForm.newPassword.trim()) { toast.error('Yeni şifre girin.'); return }
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Şifreler eşleşmedi.'); return }

    try {
      await updateUserPassword(pwUserId, pwForm.newPassword)
      toast.success('Şifre güncellendi.')
      closePwModal()
    } catch (error) {
      toast.error(error.message || 'Şifre güncellenemedi.')
    }
  }

  const onRemove = async (id, name) => {
    const result = await Swal.fire({
      title: 'Kullanıcı kaldırılsın mı?',
      text: name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Kaldır',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#dc2626',
    })

    if (result.isConfirmed) {
      try {
        await removeUser(id)
        toast.success('Kullanıcı kaldırıldı.')
      } catch (error) {
        toast.error(error.message || 'Kullanıcı kaldırılamadı.')
      }
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-slate-900">Kullanıcı Yönetimi</h1>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> Kullanıcı Ekle
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
            placeholder="Ad, e-posta, rol ara..."
            className="w-full rounded-lg border border-slate-300 px-9 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-4 py-3">Ad Soyad</th>
              <th className="px-4 py-3">E-posta</th>
              <th className="px-4 py-3">Şifre</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Son Giriş</th>
              <th className="px-4 py-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {pagedUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                  Kullanıcı bulunamadı.
                </td>
              </tr>
            )}
            {pagedUsers.map((user) => (
              <tr key={user.id} className="border-t border-slate-200 even:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800">{user.name}</td>
                <td className="px-4 py-3 text-slate-700">{user.email || '-'}</td>
                <td className="px-4 py-3 text-slate-700">{user.password || '-'}</td>
                <td className="px-4 py-3">
                  <select
                    value={String(user.role || 'user').toLowerCase()}
                    onChange={async (event) => {
                      try {
                        await updateUserRole(user.id, event.target.value)
                        toast.success('Rol guncellendi.')
                      } catch (error) {
                        toast.error(error.message || 'Rol guncellenemedi.')
                      }
                    }}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-slate-600">{user.lastLogin}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openPwModal(user)}
                      className="inline-flex items-center gap-1 rounded-md bg-sky-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-sky-700"
                    >
                      <KeyRound size={12} /> Şifre
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(user.id, user.name)}
                      className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white"
                    >
                      <Trash2 size={12} /> Cikar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <p className="text-slate-500">
          Toplam {filteredUsers.length}/{users.length} kayıt, sayfa {currentPage}/{pageCount}
        </p>
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

      {/* Kullanici Ekleme Modali */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <form onSubmit={onAddSubmit} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-slate-900">Yeni Kullanici</h2>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ad soyad"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="E-posta"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Sifre"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">Iptal</button>
              <button type="submit" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">Kaydet</button>
            </div>
          </form>
        </div>
      )}

      {/* Sifre Degistirme Modali */}
      {pwUserId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <form onSubmit={onPwSubmit} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-slate-900">Sifre Degistir</h2>
              <button type="button" onClick={closePwModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <p className="mt-1 text-sm text-slate-500">{pwUserName} adlı kullanıcının şifresi değiştirilecek.</p>
            <div className="mt-4 space-y-3">
              <input
                type="password"
                autoComplete="new-password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Yeni şifre"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="password"
                autoComplete="new-password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Yeni şifre tekrar"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closePwModal} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">Iptal</button>
              <button type="submit" className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white">Guncelle</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage


