import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { AppDataProvider } from './context/AppDataContext'
import ProtectedRoute from './components/ui/ProtectedRoute'

const UserLayout = lazy(() => import('./layouts/UserLayout'))
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const UserHomePage = lazy(() => import('./pages/user/UserHomePage'))
const UserServicesPage = lazy(() => import('./pages/user/UserServicesPage'))
const UserPricesPage = lazy(() => import('./pages/user/UserPricesPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminPricingPage = lazy(() => import('./pages/admin/AdminPricingPage'))
const AdminAnnouncementsPage = lazy(() => import('./pages/admin/AdminAnnouncementsPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))

const RouteLoader = () => {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
        Sayfa yukleniyor...
      </div>
    </div>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <AppDataProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/user"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <UserLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<UserHomePage />} />
                <Route path="services/:serviceId/:productId" element={<UserServicesPage />} />
                <Route path="services/:serviceId?" element={<UserServicesPage />} />
                <Route path="prices/:priceId?" element={<UserPricesPage />} />
              </Route>

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="pricing" element={<AdminPricingPage />} />
                <Route path="announcements" element={<AdminAnnouncementsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>

          <ToastContainer
            position="top-right"
            autoClose={2800}
            theme="colored"
            newestOnTop
          />
        </BrowserRouter>
      </AppDataProvider>
    </AuthProvider>
  )
}

export default App
