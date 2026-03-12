import { Megaphone, Users } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'

const AdminDashboardPage = () => {
  const { products, announcements, users } = useOutletContext()

  const stats = [

    { title: 'Toplam Kullanici', value: String(users.length), icon: Users, tone: 'text-blue-700 bg-blue-100' },
    {
      title: 'Yayındaki Duyuru',
      value: String(announcements.filter((item) => item.state === 'Yayınlandı').length),
      icon: Megaphone,
      tone: 'text-fuchsia-700 bg-fuchsia-100',
    },
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-linear-to-r from-slate-900 to-slate-800 p-6 text-white sm:p-8">
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-300">Ürün, fiyat, duyuru ve kullanıcı operasyonları bu panelden yönetilir.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon

          return (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">{item.title}</p>
                <span className={`rounded-lg p-2 ${item.tone}`}>
                  <Icon size={16} />
                </span>
              </div>
              <p className="mt-4 font-display text-3xl font-bold text-slate-900">{item.value}</p>
            </article>
          )
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-slate-900">Genel Durum</h2>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>Toplam urun: {products.length}</p>
          <p>Toplam duyuru: {announcements.length}</p>
          <p>Toplam kullanıcı: {users.length}</p>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboardPage

