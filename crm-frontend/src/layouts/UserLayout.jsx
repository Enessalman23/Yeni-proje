import { useEffect, useMemo, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import Swal from 'sweetalert2'
import UserNavbar from '../components/user/UserNavbar'
import { useAuth } from '../context/AuthContext'
import { useAppData } from '../context/AppDataContext'

const asTime = (value, fallback = null) => {
  const parsed = new Date(value || '').getTime()
  return Number.isFinite(parsed) ? parsed : fallback
}

const inferCreatedAtFromUserId = (userId) => {
  const parts = String(userId || '').split('-')
  if (parts.length < 2) return null
  const ts = Number(parts[1])
  if (!Number.isFinite(ts) || ts <= 0) return null
  return ts
}

const canUserSeeAnnouncement = (announcement, userCreatedAt) => {
  if (!announcement) return false
  if (announcement.state !== 'Yayınlandı') return false

  const audience = String(announcement.audience || '').trim()
  const announcementTime = asTime(announcement.publishedAt)

  if (audience === 'Tüm kullanıcılar') return true
  if (!announcementTime) return false

  if (audience === 'Sistemde kayıtlı olanlar') {
    // createdAt bilgisi yoksa kullanıcıyı "mevcut" kabul et.
    if (!userCreatedAt) return true
    return userCreatedAt <= announcementTime
  }

  if (audience === 'Sisteme yeni kayıt olanlar') {
    if (!userCreatedAt) return false
    return userCreatedAt > announcementTime
  }

  return false
}

const UserLayout = () => {
  const { user } = useAuth()
  const { announcements, users } = useAppData()
  const shownAnnouncementIdsRef = useRef(new Set())

  const currentUserCreatedAt = useMemo(() => {
    if (!user) return null

    const fromAuth = asTime(user.createdAt)
    if (fromAuth) return fromAuth

    const userFromList = users.find((item) => item.id === user.id || item.email === user.email)
    const fromList = asTime(userFromList?.createdAt)
    if (fromList) return fromList

    // createdAt alanı olmayan eski kayıtlarda id içindeki timestamp'i kullan.
    return inferCreatedAtFromUserId(user?.id || userFromList?.id)
  }, [user, users])

  useEffect(() => {
    if (!user) {
      return
    }

    const welcomeKey = `crm-welcome-shown:${user.email}`
    const alreadyShown = sessionStorage.getItem(welcomeKey) === '1'

    if (alreadyShown) {
      return
    }

    sessionStorage.setItem(welcomeKey, '1')

    Swal.fire({
      title: `Hoş geldin, ${user.name}`,
      text: 'Hizmetlerimiz ve fiyat listemiz güncellendi. Menü üzerinden detayları açabilirsin.',
      icon: 'success',
      confirmButtonText: 'Devam Et',
      confirmButtonColor: '#0047AB',
      backdrop: 'rgba(2, 12, 42, 0.45)',
    })
  }, [user])

  useEffect(() => {
    if (!user || user.role !== 'user') {
      return
    }

    const visibleAnnouncements = announcements
      .filter((item) => canUserSeeAnnouncement(item, currentUserCreatedAt))
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))

    if (visibleAnnouncements.length === 0) {
      return
    }

    const seenKey = `crm-seen-announcements:${user.email}`
    let seenIds = []

    try {
      seenIds = JSON.parse(localStorage.getItem(seenKey) || '[]')
    } catch {
      seenIds = []
    }
    const unseen = visibleAnnouncements.filter((item) => !seenIds.includes(item.id))

    if (unseen.length === 0) {
      return
    }

    const latest = unseen[0]

    if (shownAnnouncementIdsRef.current.has(latest.id)) {
      return
    }

    shownAnnouncementIdsRef.current.add(latest.id)

    Swal.fire({
      title: latest.title,
      text: latest.content || latest.message || 'İçerik bulunamadı.',
      icon: 'info',
      confirmButtonText: 'Okudum',
      confirmButtonColor: '#0047AB',
      backdrop: 'rgba(4, 20, 70, 0.45)',
      // Eğer mesaj çok uzunsa ve satır boşluklarını korumak istersen 'text' yerine 'html' kullanabilirsin:
      // html: `<div style="text-align:left; font-size:14px; white-space:pre-line;">${latest.content || latest.message}</div>`,
    }).finally(() => {
      const currentSeen = JSON.parse(localStorage.getItem(seenKey) || '[]')
      const nextSeen = [...new Set([...currentSeen, latest.id])]
      localStorage.setItem(seenKey, JSON.stringify(nextSeen))
    })
  }, [announcements, currentUserCreatedAt, user])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,#c0d8ff_0%,transparent_35%),radial-gradient(circle_at_85%_25%,#eef6d6_0%,transparent_28%)]" />
      <UserNavbar />
      <main className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-10">
        <Outlet />
      </main>
    </div>
  )
}

export default UserLayout

