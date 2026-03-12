import { API_BASE_URL, API_ENDPOINTS } from './endpoints'
import { mapAnnouncement, mapCategory, mapPricing, mapProduct } from './mappers'
import { getAccessToken } from './tokenService'
import { USE_MOCK_API } from './runtime'

const parseStreamPayload = (eventData) => {
  if (!eventData) return null

  try {
    return JSON.parse(eventData)
  } catch {
    return null
  }
}

const normalizePayload = (message) => {
  if (!message || typeof message !== 'object') {
    return null
  }

  const { type, payload } = message

  if (type === 'snapshot') {
    return {
      type,
      payload: {
        products: Array.isArray(payload?.products) ? payload.products.map(mapProduct) : [],
        pricing: Array.isArray(payload?.pricing) ? payload.pricing.map(mapPricing) : [],
        announcements: Array.isArray(payload?.announcements) ? payload.announcements.map(mapAnnouncement) : [],
        categories: Array.isArray(payload?.categories) ? payload.categories.map(mapCategory) : [],
      },
    }
  }

  if (type?.startsWith('product_')) {
    if (type === 'product_removed') {
      return {
        type,
        payload: { id: String(payload?.id || '') },
      }
    }

    return {
      type,
      payload: mapProduct(payload || {}),
    }
  }

  if (type?.startsWith('pricing_')) {
    if (type === 'pricing_removed') {
      return {
        type,
        payload: { id: String(payload?.id || '') },
      }
    }

    return {
      type,
      payload: mapPricing(payload || {}),
    }
  }

  if (type?.startsWith('announcement_')) {
    if (type === 'announcement_removed') {
      return {
        type,
        payload: { id: String(payload?.id || '') },
      }
    }

    return {
      type,
      payload: mapAnnouncement(payload || {}),
    }
  }

  if (type?.startsWith('category_')) {
    if (type === 'category_removed') {
      return {
        type,
        payload: { id: String(payload?.id || '') },
      }
    }

    return {
      type,
      payload: mapCategory(payload || {}),
    }
  }

  return null
}

export const subscribeAppDataStream = ({ onMessage, onError }) => {
  if (USE_MOCK_API) {
    return () => {}
  }

  const token = getAccessToken()
  const streamUrl = new URL(`${API_BASE_URL}${API_ENDPOINTS.realtime.appDataStream}`)

  if (token) {
    streamUrl.searchParams.set('access_token', token)
  }

  const eventSource = new EventSource(streamUrl.toString(), { withCredentials: true })

  eventSource.onmessage = (event) => {
    const parsed = parseStreamPayload(event.data)
    const normalized = normalizePayload(parsed)

    if (!normalized) {
      return
    }

    onMessage(normalized)
  }

  eventSource.onerror = (event) => {
    if (onError) {
      onError(event)
    }
  }

  return () => eventSource.close()
}
