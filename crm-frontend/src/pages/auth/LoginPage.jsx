import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

const getRedirectPath = (role) => {
  if (role === 'admin' || role === 'manager') {
    return '/admin'
  }

  return '/user'
}

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, user, authLoading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    if (!form.email || !form.password) {
      toast.error('E-posta ve şifre zorunlu')
      return
    }

    setSubmitting(true)

    try {
      const result = await login({ email: form.email, password: form.password })

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success('Giris basarili')
      navigate(getRedirectPath(result.user.role))
    } finally {
      setSubmitting(false)
    }
  }

  if (!authLoading && isAuthenticated && user) {
    return <Navigate to={getRedirectPath(user.role)} replace />
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-20 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-accent/35 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-primary/10 lg:grid-cols-2">
        <section className="hidden bg-linear-to-br from-primary to-blue-700 p-10 text-white lg:block">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            <ShieldCheck size={14} /> Kurumsal Guvenlik
          </p>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight">
            Dinamik Fiyatlandirma ile CRM Kontrolu Tek Ekranda
          </h1>
          <p className="mt-4 max-w-sm text-sm text-blue-100">
            Rol bazli erisim, gercek zamanli bildirimler ve premium deneyim ile operasyonlarinizi hizlandirin.
          </p>
        </section>

        <section className="p-6 sm:p-10">
          <h2 className="font-display text-3xl font-bold text-slate-900">Giris Yap</h2>
          <p className="mt-2 text-sm text-slate-500">E-posta ve şifrenle devam et.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">E-posta</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="ornek@firma.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Sifre</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="********"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Giris yapiliyor...' : 'Devam Et'} {!submitting && <ArrowRight size={16} />}
            </button>
            <p>
              Demo girişler
              <br />
              admin@solveline.com / Admin123!
              <br />
              manager@solveline.com / Manager123!
              <br />
              user@solveline.com / User123!
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
