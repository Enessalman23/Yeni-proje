import { API_BASE_URL, API_ENDPOINTS } from './endpoints'
import { mapAnnouncement } from './mappers'
import { getAccessToken } from './tokenService'
import { USE_MOCK_API } from './runtime'

const parseStreamPayload = (eventData) => {
  if (!eventData) {
    return null
  }

  try {
    return JSON.parse(eventData)
  } catch {
    return null
  }
}

export const subscribeAnnouncements = ({ onMessage, onError }) => {
  if (USE_MOCK_API) {
    return () => {}
  }

  const token = getAccessToken()
  const streamUrl = new URL(`${API_BASE_URL}${API_ENDPOINTS.realtime.announcementsStream}`)

  if (token) {
    streamUrl.searchParams.set('access_token', token)
  }

  const eventSource = new EventSource(streamUrl.toString(), { withCredentials: true })

  eventSource.onmessage = (event) => {
    const parsed = parseStreamPayload(event.data)

    if (!parsed) {
      return
    }

    if (Array.isArray(parsed)) {
      onMessage(parsed.map(mapAnnouncement))
      return
    }

    if (parsed.payload) {
      onMessage({ ...parsed, payload: mapAnnouncement(parsed.payload) })
      return
    }

    onMessage(mapAnnouncement(parsed))
  }

  eventSource.onerror = (event) => {
    if (onError) {
      onError(event)
    }
  }

  return () => eventSource.close()
}
