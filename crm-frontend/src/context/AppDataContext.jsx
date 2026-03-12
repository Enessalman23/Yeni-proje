import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { USE_MOCK_API } from '../services/api/runtime'
import {
  createAnnouncementRequest,
  createCategoryRequest,
  createPricingRequest,
  createProductRequest,
  createUserRequest,
  getAnnouncementsRequest,
  getCategoriesRequest,
  getPricingRequest,
  getProductsRequest,
  getUsersRequest,
  publishAnnouncementRequest,
  removeAnnouncementRequest,
  removeCategoryRequest,
  removePricingRequest,
  removeProductRequest,
  removeUserRequest,
  updateAnnouncementRequest,
  updateCategoryRequest,
  updatePricingRequest,
  updateProductRequest,
  updateUserPasswordRequest,
  updateUserRoleRequest,
} from '../services/api/adminApi'
import { subscribeAppDataStream } from '../services/api/appDataStream'

const AppDataContext = createContext(null)
const AUTO_REFRESH_MS = 15000

const mergeAnnouncement = (list, item) => {
  const without = list.filter((entry) => entry.id !== item.id)
  return [item, ...without].sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
}

const mergeItemById = (list, item) => [item, ...list.filter((entry) => entry.id !== item.id)]
const mergeProductById = (list, item) => {
  const existing = list.find((entry) => entry.id === item.id)
  if (!existing) {
    return mergeItemById(list, item)
  }

  const next = { ...existing, ...item }
  if (!item.subCategory && existing.subCategory) {
    next.subCategory = existing.subCategory
  }
  if (!item.pdfUrl && existing.pdfUrl) {
    next.pdfUrl = existing.pdfUrl
  }
  if (!item.pdfName && existing.pdfName) {
    next.pdfName = existing.pdfName
  }
  if (!item.imageUrl && existing.imageUrl) {
    next.imageUrl = existing.imageUrl
  }
  if (!item.imageName && existing.imageName) {
    next.imageName = existing.imageName
  }
  return mergeItemById(list, next)
}
const mergeProductSnapshot = (prevList, nextList) =>
  nextList.map((item) => {
    const existing = prevList.find((entry) => entry.id === item.id)
    if (!existing) {
      return item
    }

    const next = { ...existing, ...item }
    if (!item.subCategory && existing.subCategory) {
      next.subCategory = existing.subCategory
    }
    if (!item.pdfUrl && existing.pdfUrl) {
      next.pdfUrl = existing.pdfUrl
    }
    if (!item.pdfName && existing.pdfName) {
      next.pdfName = existing.pdfName
    }
    if (!item.imageUrl && existing.imageUrl) {
      next.imageUrl = existing.imageUrl
    }
    if (!item.imageName && existing.imageName) {
      next.imageName = existing.imageName
    }
    return next
  })
const removeItemById = (list, id) => list.filter((entry) => entry.id !== id)
const updateItemById = (list, id, next) => list.map((entry) => (entry.id === id ? next : entry))

export const AppDataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pricingRows, setPricingRows] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [users, setUsers] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  const resetData = useCallback(() => {
    setProducts([])
    setCategories([])
    setPricingRows([])
    setAnnouncements([])
    setUsers([])
  }, [])

  const loadAllData = useCallback(async () => {
    const [nextProducts, nextCategories, nextPricing, nextAnnouncements, nextUsers] = await Promise.all([
      getProductsRequest(),
      getCategoriesRequest(),
      getPricingRequest(),
      getAnnouncementsRequest(),
      getUsersRequest(),
    ])

    setProducts((prev) => mergeProductSnapshot(prev, nextProducts))
    setCategories(nextCategories)
    setPricingRows(nextPricing)
    setAnnouncements(nextAnnouncements)
    setUsers(nextUsers)
  }, [])

  useEffect(() => {
    let active = true

    if (!isAuthenticated) {
      resetData()
      setDataLoading(false)
      return () => {
        active = false
      }
    }

    const bootstrap = async () => {
      setDataLoading(true)

      try {
        await loadAllData()
      } catch {
        if (active) {
          resetData()
        }
      } finally {
        if (active) {
          setDataLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [isAuthenticated, loadAllData, resetData])

  useEffect(() => {
    if (!isAuthenticated) {
      return () => {}
    }

    const unsubscribe = subscribeAppDataStream({
      onMessage: (event) => {
        const { type, payload } = event || {}

        switch (type) {
          case 'snapshot':
            setProducts((prev) => mergeProductSnapshot(prev, payload.products))
            setCategories(payload.categories || [])
            setPricingRows(payload.pricing)
            setAnnouncements(payload.announcements)
            return
          case 'product_created':
          case 'product_updated':
            setProducts((prev) => mergeProductById(prev, payload))
            return
          case 'product_removed':
            setProducts((prev) => removeItemById(prev, payload.id))
            return
          case 'category_created':
          case 'category_updated':
            setCategories((prev) => mergeItemById(prev, payload))
            return
          case 'category_removed':
            setCategories((prev) => removeItemById(prev, payload.id))
            return
          case 'pricing_created':
          case 'pricing_updated':
            setPricingRows((prev) => mergeItemById(prev, payload))
            return
          case 'pricing_removed':
            setPricingRows((prev) => removeItemById(prev, payload.id))
            return
          case 'announcement_created':
          case 'announcement_updated':
          case 'announcement_published':
            setAnnouncements((prev) => mergeAnnouncement(prev, payload))
            return
          case 'announcement_removed':
            if (payload?.id) {
              setAnnouncements((prev) => removeItemById(prev, payload.id))
            }
            return
          default:
            return
        }
      },
      onError: () => {
        // SSE hatasi otomatik reconnect ile toparlanir.
      },
    })

    return unsubscribe
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      return () => {}
    }

    const refreshData = async () => {
      try {
        await loadAllData()
      } catch {
        // Arka plan yenileme hatasi sessiz gecilir.
      }
    }

    const intervalId = setInterval(refreshData, AUTO_REFRESH_MS)
    const onFocus = () => {
      refreshData()
    }

    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
    }
  }, [isAuthenticated, loadAllData])

  const value = useMemo(
    () => ({
      dataLoading,
      reloadData: loadAllData,

      products,
      categories,
      addCategory: async (payload) => {
        const created = await createCategoryRequest(payload)
        setCategories((prev) => mergeItemById(prev, created))
        return created
      },
      updateCategory: async (id, payload) => {
        const updated = await updateCategoryRequest(id, payload)
        setCategories((prev) => updateItemById(prev, id, updated))
        return updated
      },
      removeCategory: async (id) => {
        await removeCategoryRequest(id)
        setCategories((prev) => removeItemById(prev, id))
      },
      addProduct: async (payload) => {
        const created = await createProductRequest(payload)
        // Mock modda SSE yok, optimistic update gerekli
        // Gerçek API modda SSE gelmeden UI'yi güncelle, SSE eksik alan gelirse mergeProductById korur.
        setProducts((prev) => mergeProductById(prev, created))
        return created
      },
      updateProduct: async (id, payload) => {
        const updated = await updateProductRequest(id, payload)
        setProducts((prev) => updateItemById(prev, id, updated))
        return updated
      },
      removeProduct: async (id) => {
        await removeProductRequest(id)
        setProducts((prev) => removeItemById(prev, id))
      },

      pricingRows,
      addPricing: async (payload) => {
        const created = await createPricingRequest(payload)
        // Mock modda SSE yok, optimistic update gerekli
        // Gerçek API modda SSE pricing_created eventi state'i güncelleyecek
        if (USE_MOCK_API) {
          setPricingRows((prev) => mergeItemById(prev, created))
        }
        return created
      },
      updatePricing: async (id, payload) => {
        const updated = await updatePricingRequest(id, payload)
        setPricingRows((prev) => updateItemById(prev, id, updated))
        return updated
      },
      removePricing: async (id) => {
        await removePricingRequest(id)
        setPricingRows((prev) => removeItemById(prev, id))
      },

      announcements,
      addAnnouncement: async (payload) => {
        const created = await createAnnouncementRequest(payload)
        setAnnouncements((prev) => mergeAnnouncement(prev, created))
        return created
      },
      updateAnnouncement: async (id, payload) => {
        const updated = await updateAnnouncementRequest(id, payload)
        setAnnouncements((prev) => mergeAnnouncement(prev, updated))
        return updated
      },
      publishAnnouncement: async (id) => {
        const published = await publishAnnouncementRequest(id)
        setAnnouncements((prev) => mergeAnnouncement(prev, published))
        return published
      },
      removeAnnouncement: async (id) => {
        await removeAnnouncementRequest(id)
        setAnnouncements((prev) => removeItemById(prev, id))
      },

      users,
      addUser: async (payload) => {
        const created = await createUserRequest(payload)
        setUsers((prev) => [...prev, created])
        return created
      },
      updateUserRole: async (id, role) => {
        const updated = await updateUserRoleRequest(id, role)
        setUsers((prev) => updateItemById(prev, id, updated))
        return updated
      },
      updateUserPassword: async (id, password) => {
        await updateUserPasswordRequest(id, password)
        setUsers((prev) => prev.map((item) => (item.id === id ? { ...item, password } : item)))
      },
      removeUser: async (id) => {
        await removeUserRequest(id)
        setUsers((prev) => removeItemById(prev, id))
      },
    }),
    [announcements, categories, dataLoading, loadAllData, pricingRows, products, users],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export const useAppData = () => {
  const context = useContext(AppDataContext)

  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider')
  }

  return context
}

