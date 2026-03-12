import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { priceCatalog, serviceCatalog } from '../../services/catalogData'
import { useAppData } from '../../context/AppDataContext'

const normalize = (value) => String(value || '').trim().toLowerCase()

const UserPricesPage = () => {
  const { priceId } = useParams()
  const { pricingRows, products } = useAppData()

  const effectivePrices = pricingRows.length > 0 ? pricingRows : priceCatalog

  const selectedPrice = useMemo(() => {
    if (!priceId) return effectivePrices[0]
    return effectivePrices.find((price) => String(price.id) === String(priceId)) || effectivePrices[0]
  }, [effectivePrices, priceId])

  const selectedService = useMemo(() => {
    if (!selectedPrice) return serviceCatalog[0]

    const matchedProduct = products.find((item) => normalize(item.name) === normalize(selectedPrice.plan))
    const categoryKey = normalize(matchedProduct?.category || selectedPrice.serviceId)

    return serviceCatalog.find((service) => normalize(service.id) === categoryKey) || serviceCatalog[0]
  }, [products, selectedPrice])

  if (!selectedPrice) {
    return null
  }

  const currentPriceValue = selectedPrice.monthly || selectedPrice.current || '-'
  const secondaryPriceLabel = selectedPrice.setup ? 'Kurulum' : 'Onceki Fiyat'
  const secondaryPriceValue = selectedPrice.setup || selectedPrice.old || '-'

  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-3xl bg-linear-to-r from-primary to-blue-700 p-7 text-white shadow-lg shadow-blue-900/20 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Fiyat Detayi</p>
        <h1 className="mt-3 font-display text-3xl font-bold">{selectedPrice.plan || selectedPrice.service}</h1>
        <p className="mt-2 text-sm text-blue-100">Ilgili hizmet: {selectedService?.name}</p>
        <div className="mt-5 grid max-w-xl gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-wider text-blue-100">Aylik Ucret</p>
            <p className="mt-1 text-2xl font-bold">{currentPriceValue}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-wider text-blue-100">{secondaryPriceLabel}</p>
            <p className="mt-1 text-2xl font-bold">{secondaryPriceValue}</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default UserPricesPage
