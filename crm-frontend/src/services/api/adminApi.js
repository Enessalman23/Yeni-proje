import { apiClient } from './client'
import { API_ENDPOINTS } from './endpoints'
import {
  mapAnnouncement,
  mapCategory,
  mapPricing,
  mapProduct,
  mapUser,
  toCategoryDto,
  toAnnouncementDto,
  toPricingDto,
  toProductDto,
  toUserDto,
  unwrapData,
} from './mappers'
import {
  mockCreateAnnouncement,
  mockCreateCategory,
  mockCreatePricing,
  mockCreateProduct,
  mockCreateUser,
  mockGetAnnouncements,
  mockGetCategories,
  mockGetPricing,
  mockGetProducts,
  mockGetUsers,
  mockPublishAnnouncement,
  mockRemoveAnnouncement,
  mockRemoveCategory,
  mockRemovePricing,
  mockRemoveProduct,
  mockRemoveUser,
  mockUpdateAnnouncement,
  mockUpdateCategory,
  mockUpdatePricing,
  mockUpdateProduct,
  mockUpdateUserPassword,
  mockUpdateUserRole,
} from './mockApi'
import { USE_MOCK_API } from './runtime'

const asArray = (value) => (Array.isArray(value) ? value : [])
const isNetworkError = (error) => !error?.status

export const getProductsRequest = async () => {
  if (USE_MOCK_API) return mockGetProducts()
  try {
    const response = await apiClient.get(API_ENDPOINTS.admin.products)
    return asArray(unwrapData(response.data)).map(mapProduct)
  } catch (error) {
    if (isNetworkError(error)) return mockGetProducts()
    throw error
  }
}

export const getCategoriesRequest = async () => {
  if (USE_MOCK_API) return mockGetCategories()
  try {
    const response = await apiClient.get(API_ENDPOINTS.admin.categories)
    return asArray(unwrapData(response.data)).map(mapCategory)
  } catch (error) {
    if (isNetworkError(error)) return mockGetCategories()
    throw error
  }
}

export const createCategoryRequest = async (payload) => {
  if (USE_MOCK_API) return mockCreateCategory(payload)
  try {
    const response = await apiClient.post(API_ENDPOINTS.admin.categories, toCategoryDto(payload))
    return mapCategory(unwrapData(response.data) || payload)
  } catch (error) {
    if (isNetworkError(error)) return mockCreateCategory(payload)
    throw error
  }
}

export const updateCategoryRequest = async (id, payload) => {
  if (USE_MOCK_API) return mockUpdateCategory(id, payload)
  try {
    const response = await apiClient.put(`${API_ENDPOINTS.admin.categories}/${id}`, toCategoryDto(payload))
    return mapCategory(unwrapData(response.data) || { id, ...payload })
  } catch (error) {
    if (isNetworkError(error)) return mockUpdateCategory(id, payload)
    throw error
  }
}

export const removeCategoryRequest = async (id) => {
  if (USE_MOCK_API) return mockRemoveCategory(id)
  try {
    await apiClient.delete(`${API_ENDPOINTS.admin.categories}/${id}`)
  } catch (error) {
    if (isNetworkError(error)) return mockRemoveCategory(id)
    throw error
  }
}

export const createProductRequest = async (payload) => {
  if (USE_MOCK_API) return mockCreateProduct(payload)
  try {
    const response = await apiClient.post(API_ENDPOINTS.admin.products, toProductDto(payload))
    const data = unwrapData(response.data) || {}
    const merged = { ...payload, ...data }
    if (!merged.subCategory && payload.subCategory) {
      merged.subCategory = payload.subCategory
    }
    return mapProduct(merged)
  } catch (error) {
    if (isNetworkError(error)) return mockCreateProduct(payload)
    throw error
  }
}

export const uploadProductPdfRequest = async (file) => {
  if (USE_MOCK_API) {
    const error = new Error('Mock modunda dosya upload endpointi kapali.')
    error.status = 0
    throw error
  }

  const formData = new FormData()
  formData.append('pdf', file)

  const response = await apiClient.post(API_ENDPOINTS.admin.uploadPdf, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return unwrapData(response.data) || {}
}

export const uploadProductImageRequest = async (file) => {
  if (USE_MOCK_API) {
    const error = new Error('Mock modunda gorsel upload endpointi kapali.')
    error.status = 0
    throw error
  }

  const formData = new FormData()
  formData.append('image', file)

  const response = await apiClient.post(API_ENDPOINTS.admin.uploadImage, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return unwrapData(response.data) || {}
}

export const updateProductRequest = async (id, payload) => {
  if (USE_MOCK_API) return mockUpdateProduct(id, payload)
  try {
    const response = await apiClient.put(`${API_ENDPOINTS.admin.products}/${id}`, toProductDto(payload))
    const data = unwrapData(response.data) || {}
    const merged = { id, ...payload, ...data }
    if (!merged.subCategory && payload.subCategory) {
      merged.subCategory = payload.subCategory
    }
    return mapProduct(merged)
  } catch (error) {
    if (isNetworkError(error)) return mockUpdateProduct(id, payload)
    throw error
  }
}

export const removeProductRequest = async (id) => {
  if (USE_MOCK_API) return mockRemoveProduct(id)
  try {
    await apiClient.delete(`${API_ENDPOINTS.admin.products}/${id}`)
  } catch (error) {
    if (isNetworkError(error)) return mockRemoveProduct(id)
    throw error
  }
}

export const getPricingRequest = async () => {
  if (USE_MOCK_API) return mockGetPricing()
  try {
    const response = await apiClient.get(API_ENDPOINTS.admin.pricing)
    return asArray(unwrapData(response.data)).map(mapPricing)
  } catch (error) {
    if (isNetworkError(error)) return mockGetPricing()
    throw error
  }
}

export const createPricingRequest = async (payload) => {
  if (USE_MOCK_API) return mockCreatePricing(payload)
  try {
    const response = await apiClient.post(API_ENDPOINTS.admin.pricing, toPricingDto(payload))
    return mapPricing(unwrapData(response.data) || payload)
  } catch (error) {
    if (isNetworkError(error)) return mockCreatePricing(payload)
    throw error
  }
}

export const updatePricingRequest = async (id, payload) => {
  if (USE_MOCK_API) return mockUpdatePricing(id, payload)
  try {
    const response = await apiClient.put(`${API_ENDPOINTS.admin.pricing}/${id}`, toPricingDto(payload))
    return mapPricing(unwrapData(response.data) || { id, ...payload })
  } catch (error) {
    if (isNetworkError(error)) return mockUpdatePricing(id, payload)
    throw error
  }
}

export const removePricingRequest = async (id) => {
  if (USE_MOCK_API) return mockRemovePricing(id)
  try {
    await apiClient.delete(`${API_ENDPOINTS.admin.pricing}/${id}`)
  } catch (error) {
    if (isNetworkError(error)) return mockRemovePricing(id)
    throw error
  }
}

export const getAnnouncementsRequest = async () => {
  if (USE_MOCK_API) return mockGetAnnouncements()
  try {
    const response = await apiClient.get(API_ENDPOINTS.admin.announcements)
    return asArray(unwrapData(response.data)).map(mapAnnouncement)
  } catch (error) {
    if (isNetworkError(error)) return mockGetAnnouncements()
    throw error
  }
}

export const createAnnouncementRequest = async (payload) => {
  if (USE_MOCK_API) return mockCreateAnnouncement(payload)
  try {
    const response = await apiClient.post(API_ENDPOINTS.admin.announcements, toAnnouncementDto(payload))
    return mapAnnouncement(unwrapData(response.data) || payload)
  } catch (error) {
    if (isNetworkError(error)) return mockCreateAnnouncement(payload)
    throw error
  }
}

export const publishAnnouncementRequest = async (id) => {
  if (USE_MOCK_API) return mockPublishAnnouncement(id)
  try {
    const response = await apiClient.post(API_ENDPOINTS.admin.announcementPublish(id))
    return mapAnnouncement(unwrapData(response.data) || { id, state: 'Yayınlandı' })
  } catch (error) {
    if (isNetworkError(error)) return mockPublishAnnouncement(id)
    throw error
  }
}

export const updateAnnouncementRequest = async (id, payload) => {
  if (USE_MOCK_API) return mockUpdateAnnouncement(id, payload)
  try {
    const response = await apiClient.put(`${API_ENDPOINTS.admin.announcements}/${id}`, toAnnouncementDto(payload))
    return mapAnnouncement(unwrapData(response.data) || { id, ...payload })
  } catch (error) {
    if (isNetworkError(error)) return mockUpdateAnnouncement(id, payload)
    throw error
  }
}

export const removeAnnouncementRequest = async (id) => {
  if (USE_MOCK_API) return mockRemoveAnnouncement(id)
  try {
    await apiClient.delete(`${API_ENDPOINTS.admin.announcements}/${id}`)
  } catch (error) {
    if (isNetworkError(error)) return mockRemoveAnnouncement(id)
    throw error
  }
}

export const getUsersRequest = async () => {
  if (USE_MOCK_API) return mockGetUsers()
  try {
    const response = await apiClient.get(API_ENDPOINTS.admin.users)
    return asArray(unwrapData(response.data)).map(mapUser)
  } catch (error) {
    if (isNetworkError(error)) return mockGetUsers()
    throw error
  }
}

export const createUserRequest = async (payload) => {
  if (USE_MOCK_API) return mockCreateUser(payload)
  try {
    const response = await apiClient.post(API_ENDPOINTS.admin.users, toUserDto(payload))
    return mapUser(unwrapData(response.data) || payload)
  } catch (error) {
    if (isNetworkError(error)) return mockCreateUser(payload)
    throw error
  }
}

export const updateUserRoleRequest = async (id, role) => {
  if (USE_MOCK_API) return mockUpdateUserRole(id, role)
  try {
    const response = await apiClient.patch(API_ENDPOINTS.admin.userRole(id), { role })
    return mapUser(unwrapData(response.data) || { id, role })
  } catch (error) {
    if (isNetworkError(error)) return mockUpdateUserRole(id, role)
    throw error
  }
}

export const updateUserPasswordRequest = async (id, password) => {
  if (USE_MOCK_API) return mockUpdateUserPassword(id, password)
  try {
    const response = await apiClient.patch(`${API_ENDPOINTS.admin.users}/${id}/password`, { password })
    return unwrapData(response.data) || { success: true }
  } catch (error) {
    if (isNetworkError(error)) return mockUpdateUserPassword(id, password)
    throw error
  }
}

export const removeUserRequest = async (id) => {
  if (USE_MOCK_API) return mockRemoveUser(id)
  try {
    await apiClient.delete(`${API_ENDPOINTS.admin.users}/${id}`)
  } catch (error) {
    if (isNetworkError(error)) return mockRemoveUser(id)
    throw error
  }
}
