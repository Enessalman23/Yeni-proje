import { ChevronDown, ChevronRight, LogOut } from 'lucide-react'
import { useMemo, useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { priceMenuItems, serviceCatalog } from '../../services/catalogData'
import { useAppData } from '../../context/AppDataContext'
import logo from '../../assets/solveline_logo-removebg-preview.png'

const normalize = (value) => String(value || '').trim().toLowerCase()
const slugify = (value) =>
  normalize(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const UserNavbar = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { pricingRows, products, categories } = useAppData()
  const [openMenu, setOpenMenu] = useState(null)
  const [openServiceId, setOpenServiceId] = useState(null)
  const navRef = useRef(null)

  const dynamicPriceItems = useMemo(() => {
    if (pricingRows.length === 0) return priceMenuItems
    return pricingRows.map((row) => ({
      id: row.id,
      label: row.plan,
      href: `/user/prices/${row.id}`,
    }))
  }, [pricingRows])

  const enrichedCatalog = useMemo(() => {
    const baseSeed = categories.length
      ? categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
      }))
      : serviceCatalog.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
      }))

    const baseCatalog = baseSeed.map((cat) => {
      const catalogMatch = serviceCatalog.find(
        (item) => normalize(item.name) === normalize(cat.name),
      )
      const matchedProducts = products.filter(
        (p) => normalize(p.category) === normalize(cat.name) && !String(p.subCategory || '').trim(),
      )
      const subCategoryNames = [
        ...new Set(
          products
            .filter((p) => normalize(p.category) === normalize(cat.name))
            .map((p) => p.subCategory)
            .filter((name) => String(name || '').trim()),
        ),
      ]

      const baseEntries =
        matchedProducts.length > 0
          ? matchedProducts.map((product) => ({
            id: product.id,
            name: product.name,
            href: `/user/services/${slugify(cat.name)}/${slugify(product.name)}`,
          }))
          : (catalogMatch?.items || []).map((name) => ({
            id: `${cat.id}-${name}`,
            name,
            href: `/user/services/${slugify(cat.name)}/${slugify(name)}`,
          }))

      const baseNames = new Set(baseEntries.map((entry) => normalize(entry.name)))
      const subEntries = subCategoryNames
        .filter((name) => !baseNames.has(normalize(name)))
        .map((name) => ({
          id: slugify(name),
          name,
          href: `/user/services/${slugify(cat.id)}/${slugify(name)}`,
        }))

      const productEntries = [...baseEntries, ...subEntries]

      return {
        ...cat,
        description: cat.description || catalogMatch?.description || '',
        productEntries,
      }
    })

    const knownCategoryNames = new Set(baseCatalog.map((cat) => normalize(cat.name)))
    const extraCategories = products
      .map((product) => product.category)
      .filter((category) => normalize(category) && !knownCategoryNames.has(normalize(category)))

    const uniqueExtraCategories = [...new Set(extraCategories)]
    const extraCatalog = uniqueExtraCategories.map((category, index) => {
      const categoryProducts = products.filter(
        (product) => normalize(product.category) === normalize(category) && !String(product.subCategory || '').trim(),
      )
      const subCategoryNames = [
        ...new Set(
          products
            .filter((product) => normalize(product.category) === normalize(category))
            .map((product) => product.subCategory)
            .filter((name) => String(name || '').trim()),
        ),
      ]
      const categoryId = slugify(category)
      const baseNames = new Set(categoryProducts.map((product) => normalize(product.name)))
      return {
        id: categoryId || `kategori-${index + 1}`,
        name: category,
        productEntries: [
          ...categoryProducts.map((product) => ({
            id: product.id,
            name: product.name,
            href: `/user/services/${slugify(categoryId)}/${product.name}`,
          })),
          ...subCategoryNames
            .filter((name) => !baseNames.has(normalize(name)))
            .map((name) => ({
              id: slugify(name),
              name,
              href: `/user/services/${slugify(categoryId)}/${slugify(name)}`,
            })),
        ],
      }
    })

    return [...baseCatalog, ...extraCatalog]
  }, [categories, products])

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null)
        setOpenServiceId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const onLogout = async () => {
    await logout()
    navigate('/login')
  }

  const go = (href) => {
    setOpenMenu(null)
    setOpenServiceId(null)
    navigate(href)
  }

  const dropdownOpen = openMenu === 'services'

  return (
    <header className="fixed left-0 top-0 z-40 w-full border-b border-white/10 bg-primary text-white shadow-lg shadow-blue-950/20">
      <nav ref={navRef} className="mx-auto flex h-20 w-full max-w-300 items-center justify-between px-6">
        <button type="button" onClick={() => go('/user')}>
          <img src={logo} alt="Solveline Logo" className="h-15 w-60 cursor-pointer" />
        </button>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => go('/user')}
            className="rounded-md px-3 py-2 text-[13px] font-semibold  tracking-wide text-white/90 transition hover:bg-white/10 cursor-pointer"
          >
            Ana Sayfa
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenMenu((prev) => {
                  const next = prev === 'services' ? null : 'services'
                  if (next !== 'services') {
                    setOpenServiceId(null)
                  }
                  return next
                })
              }
              className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-[13px] font-semibold  tracking-wide transition cursor-pointer ${dropdownOpen
                ? 'border-amber-300 text-amber-300'
                : 'border-white/30 bg-white/10 text-white/90 hover:bg-white/20'
                }`}
            >
              Hizmetlerimiz
              <ChevronDown size={14} className={dropdownOpen ? 'rotate-180 transition' : 'transition'} />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-12 z-50 w-70 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
                <ul className="divide-y divide-slate-100">
                  {enrichedCatalog.map((cat) => {
                    const isOpen = openServiceId === cat.id
                    return (
                      <li key={cat.id} className="group">
                        <button
                          type="button"
                          onClick={() => setOpenServiceId((prev) => (prev === cat.id ? null : cat.id))}
                          className={`flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium transition cursor-pointer ${isOpen ? 'bg-slate-50 text-slate-900' : 'text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                          <span>{cat.name}</span>
                          <ChevronRight
                            size={16}
                            className={`text-slate-300 transition group-hover:text-primary  ${isOpen ? 'rotate-90 text-primary' : ''
                              }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="bg-slate-50 px-5 pb-3">
                            <div className="flex flex-col gap-1.5">
                              {cat.productEntries.map((entry) => (
                                <button
                                  key={entry.id}
                                  type="button"
                                  onClick={() => go(entry.href)}
                                  className="flex items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] text-slate-600 transition hover:bg-white hover:text-primary"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                  {entry.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((prev) => (prev === 'prices' ? null : 'prices'))}
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold  tracking-wide text-white/90 transition hover:bg-white/10 cursor-pointer"
            >
              Fiyat Listemiz
              <ChevronDown size={14} className={openMenu === 'prices' ? 'rotate-180 transition' : 'transition'} />
            </button>

            {openMenu === 'prices' && (
              <div className="absolute left-0 top-12 z-50 min-w-60 overflow-hidden rounded-2xl border border-slate-100 bg-white text-slate-800 shadow-2xl ring-1 ring-slate-900/5">
                {dynamicPriceItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.href)}
                    className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm font-semibold transition last:border-0 hover:bg-blue-50 hover:text-primary"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/20 cursor-pointer"
        >
          <LogOut size={15} /> Çıkış
        </button>
      </nav>
    </header>
  )
}

export default UserNavbar
