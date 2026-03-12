/**
 * PDF icerik arama yardimci servisi (pdfjs-dist)
 * PDF URL'den metin cikarir ve query eslesmesi kontrol eder.
 */

import * as pdfjsLib from 'pdfjs-dist'

// pdfjs worker'i CDN'den yukle (Vite bundle sorununu onler)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

// URL bazli on bellek — ayni PDF tekrar parse edilmez
const textCache = new Map()

/**
 * PDF URL'inden tum metin iceriğini cikarir.
 * @param {string} url
 * @returns {Promise<string>}
 */
export const extractPdfText = async (url) => {
  if (!url) return ''
  if (textCache.has(url)) return textCache.get(url)

  try {
    const loadingTask = pdfjsLib.getDocument({ url, verbosity: 0 })
    const pdf = await loadingTask.promise
    const pageTexts = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((item) => item.str).join(' ')
      pageTexts.push(pageText)
    }

    const fullText = pageTexts.join(' ')
    textCache.set(url, fullText)
    return fullText
  } catch {
    // PDF yuklenemez veya CORS engeli — bos don
    textCache.set(url, '')
    return ''
  }
}

/**
 * Verilen URL'deki PDF'in query stringi icerip icermedigini kontrol eder.
 * @param {string} url
 * @param {string} query
 * @returns {Promise<boolean>}
 */
export const searchInPdf = async (url, query) => {
  if (!url || !query.trim()) return false
  const text = await extractPdfText(url)
  return text.toLowerCase().includes(query.trim().toLowerCase())
}

/**
 * Birden cok urun icin PDF arama yapar, eslesenler'in id setini dondurur.
 * @param {Array<{id: string, pdfUrl: string}>} products
 * @param {string} query
 * @returns {Promise<Set<string>>}
 */
export const searchProductPdfs = async (products, query) => {
  if (!query.trim()) return new Set()

  const results = await Promise.all(
    products
      .filter((p) => p.pdfUrl)
      .map(async (p) => {
        const matches = await searchInPdf(p.pdfUrl, query)
        return matches ? p.id : null
      }),
  )

  return new Set(results.filter(Boolean))
}
