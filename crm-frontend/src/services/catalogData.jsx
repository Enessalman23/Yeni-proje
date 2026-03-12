import { Bot, Cpu, Layers, Network, Phone } from 'lucide-react'

export const serviceCatalog = [
  {
    id: 'yapay-zeka',
    name: 'Yapay Zeka Çözümleri (Solvenix Serisi)',
    icon: Bot,
    description: 'Sosyal medya yönetiminden sesli asistan sistemlerine kadar yapay zeka destekli çözümler.',
    detail:
      'Solvenix serisi; kalite değerlendirme, outbound otomasyon, LLM tabanlı analiz ve sesli asistan teknolojileri ile iş süreçlerinizi dönüştürür.',
    longDescription: [
      'Solvenix Serisi, iletişim merkezleriniz için özel geliştirilmiş yapay zeka çözümleri sunar. Sosyal medya izleme, kalite değerlendirme ve Touch ile Outbound modülleri tek platformda birleşir.',
      'LLM destekli analiz motoru ve sesli asistan teknolojisi ile müşteri deneyimini otomatikleştirin. Gerçek zamanlı raporlama ve sürekli öğrenen modeller ile verimlilik artışı sağlanır.',
    ],
    pdfUrl: '',
    color: 'from-violet-500 to-purple-400',
    heroImage:
      'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1400&q=80',
    items: ['Sosyal Medya', 'Kalite Değerlendirme', 'Touch', 'Outbound', 'LLM', 'Sesli Asistan'],
  },
  {
    id: 'yazilim-crm',
    name: 'Yazılım ve CRM Çözümleri',
    icon: Layers,
    description: 'Callintech CRM ve Ncvav Santral ile güçlü müşteri ilişkileri yönetimi.',
    detail:
      'Callintech CRM ile müşteri verilerini merkezi yönetin; Ncvav Santral ile çağrı trafiğinizi tek ekrandan takip edin.',
    longDescription: [
      'Callintech CRM, satış süreçlerinizi, müşteri takiplerinizi ve raporlamalarınızı tek bir akıllı platforma taşır. Bulut tabanlı yapısı ile her yerden erişim sağlanır.',
      'Ncvav Santral çözümü ile kurumsal telefon altyapınızı modernize edin. IVR, kuyruk yönetimi, dahili hat ve detaylı çağrı raporları için eksiksiz bir çözüm.',
    ],
    pdfUrl: '',
    color: 'from-sky-500 to-cyan-400',
    heroImage:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=80',
    items: ['Callintech (CRM)', 'Ncvav (Santral)'],
  },
  {
    id: 'telekom',
    name: 'Telekom ve Bağlantı Hizmetleri',
    icon: Phone,
    description: 'Sabit telefon, SMS, SIP Trunk ve IYS dahil eksiksiz telekom altyapısı.',
    detail:
      'GSM Gateway, SIP Trunk ve İnternet hizmetleri ile kesintisiz iletişim altyapısı; IYS entegrasyonu ile yasal uyumluluk.',
    longDescription: [
      'Sabit telefon hatları, GSM Gateway bağlantıları, toplu SMS gönderimi ve kurumsal internet çözümleri tek çatı altında sunulur. Operatörden bağımsız SIP Trunk altyapısı ile maliyetlerinizi düşürün.',
      'IYS (İleti Yönetim Sistemi) entegrasyonu ile ticari elektronik ileti yönetiminizi yasal çerçevede kolayca yönetin. Tüm telekom hizmetleri tek panel üzerinden izlenir ve yönetilir.',
    ],
    pdfUrl: '',
    color: 'from-emerald-500 to-teal-400',
    heroImage:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
    items: ['Sabit Telefon', 'GSM Gateway', 'SMS', 'İnternet', 'SIP Trunk', 'IYS'],
  },
  {
    id: 'altyapi-donanim',
    name: 'Altyapı ve Donanım',
    icon: Cpu,
    description: 'GPU dahil sunucu kiralama, VPN, IP telefon, kulaklık ve network ürünleri.',
    detail:
      'Yüksek performanslı GPU sunucu kiralama, kurumsal VPN, profesyonel IP telefon ve çağrı merkezi donanım çözümleri.',
    longDescription: [
      'GPU dahil sunucu kiralama ile yapay zeka modellerinizi ve yoğun iş yüklerinizi bulut altyapımızda çalıştırın. Kurumsal VPN ile güvenli uzaktan erişim sağlayın.',
      'IP telefon, profesyonel kulaklık ve network cihazları ile çağrı merkezinizin donanım altyapısını eksiksiz kurun. Video konferans sistemleri ile ekiplerinizi dijital ortamda buluşturun.',
    ],
    pdfUrl: '',
    color: 'from-orange-500 to-amber-400',
    heroImage:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80',
    items: ['Sunucu Kiralama (GPU dahil)', 'VPN', 'IP Telefon', 'Kulaklık', 'Network ve Video Konferans'],
  },
  {
    id: 'katma-degerli',
    name: 'Katma Değerli Servisler',
    icon: Network,
    description: 'STT/TTS, sesli mesaj ve profesyonel seslendirme hizmetleri.',
    detail:
      'Konuşmayı metne ve metni konuşmaya dönüştürme, kurumsal sesli mesaj sistemleri ve stüdyo kalitesinde profesyonel seslendirme.',
    longDescription: [
      'STT (Speech-to-Text) ve TTS (Text-to-Speech) teknolojileri ile çağrı kayıtlarınızı otomatik transkribe edin, IVR sistemlerinize doğal sesli yanıtlar ekleyin.',
      'Profesyonel seslendirme hizmetimiz ile kurumsal IVR mesajlarınızı ve reklam içeriklerinizi stüdyo kalitesinde üretin. Sesli mesaj sistemleri ile müşterilerinize kişiselleştirilmiş bildirimler gönderin.',
    ],
    pdfUrl: '',
    color: 'from-rose-500 to-pink-400',
    heroImage:
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1400&q=80',
    items: ['STT/TTS', 'Sesli Mesaj', 'Profesyonel Seslendirme'],
  },
]

export const priceCatalog = []

export const serviceMenuItems = serviceCatalog.map((service) => ({
  id: service.id,
  label: service.name,
  href: `/user/services/${service.id}`,
}))

export const priceMenuItems = priceCatalog.map((price) => ({
  id: price.id,
  label: price.service,
  href: `/user/prices/${price.id}`,
}))
