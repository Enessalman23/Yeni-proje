import { ChartNoAxesCombined, Megaphone, Sparkles } from 'lucide-react'

const highlights = [
  {
    title: 'Anlık Bilgilendirme',
    description: 'Fiyat değişiklikleri ve kampanya duyuruları saniyeler içinde kullanıcıya ulaşır.',
    icon: Megaphone,
  },
  {
    title: 'Ölçeklenebilir Raporlama',
    description: 'Hizmet bazlı performans ve maliyet analizi tek panelde görüntülenebilir.',
    icon: ChartNoAxesCombined,
  },
]

const UserHomePage = () => {
  return (
    <div className="space-y-10 pb-10">
      <section className="relative overflow-hidden rounded-[28px] bg-linear-to-br from-[#1e44b7] via-[#1744bb] to-[#0f2e8f] px-6 py-14 text-white sm:px-10 lg:px-16 lg:py-16">
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-accent">
            <Sparkles size={14} /> Solveline
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-4xl">
            Hoş geldiniz. Hizmet ve fiyat detaylarını menüden seçerek ilerleyin.
          </h1>
          <p className="mt-4 text-base text-blue-100 sm:text-lg">
            Üst menüdeki Hizmetlerimiz veya Fiyat Listemiz alanına gelip açılan listeden ilgili ürünü seçin.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon

          return (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="inline-flex rounded-xl bg-blue-50 p-2 text-primary">
                <Icon size={18} />
              </span>
              <h3 className="mt-3 font-display text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </article>
          )
        })}
      </section>

      {/* <section className="grid gap-4 lg:grid-cols-3">
        {visibleProducts.map((product) => {
          const template =
            serviceCatalog.find((service) => normalize(service.id) === normalize(product.category)) || serviceCatalog[0]

          return (
            <article key={product.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <img src={template.heroImage} alt={product.name} className="h-44 w-full object-cover" />
              <div className="p-5">
                <h3 className="font-display text-2xl font-bold text-slate-900">{product.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{template.description}</p>
                <button
                  type="button"
                  onClick={() => navigate(`/user/services/${product.id}`)}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-blue-700"
                >
                  Hizmete Git
                </button>
              </div>
            </article>
          )
        })}
      </section> */}

      <section id="contact" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          İletişim
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-slate-900">Kurumsal destek ekibiyle bağlantı kurun</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Fiyatlar, hizmet geçişleri ve entegrasyon süreçleri için destek ekibimizle görüşebilirsiniz.
        </p>
        <div className="mt-5 grid  gap-3 text-sm text-slate-700 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-bold text-slate-900">Telefon</p>
            <p className="mt-1">+90 212 000 00 00</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-bold text-slate-900">E-posta</p>
            <p className="mt-1">destek@solveline.com</p>
          </div>
          {/* <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-bold text-slate-900">Canlı Destek</p>
            <p className="mt-1">Hafta içi 09:00 - 18:00</p>
          </div> */}
        </div>
      </section>
    </div>
  )
}

export default UserHomePage

