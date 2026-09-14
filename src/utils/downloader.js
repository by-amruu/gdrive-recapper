/**
 * downloader.js — Reliable Google Drive media downloader & ZIP packager
 * Handles CORS issues, direct browser download triggers, and mobile compatibility
 */

/**
 * Fetch a media item as Blob using multi-tier fallback:
 * 1. Google Drive API media endpoint (if apiKey available, allows full original file download)
 * 2. wsrv.nl proxy (fast, reliable image proxy with CORS headers for zip packaging)
 * 3. direct google thumbnail / lh3 endpoint
 */
export async function fetchMediaBlob(item, apiKey = '') {
  const fileId = item.id

  // 1. If API Key is provided, try direct Drive API v3 alt=media (Full Original Resolution)
  if (apiKey) {
    try {
      const apiRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`)
      if (apiRes.ok) {
        const blob = await apiRes.blob()
        if (blob && blob.size > 0) return blob
      }
    } catch {
      // fallback to next
    }
  }

  // 2. High-res image via wsrv.nl CORS-friendly cache proxy
  // wsrv.nl can proxy public Google Drive thumbnails with CORS allowed everywhere
  const targetGoogleUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2500`
  try {
    const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(targetGoogleUrl)}&output=jpg&q=95`
    const res = await fetch(proxyUrl)
    if (res.ok) {
      const blob = await res.blob()
      if (blob && blob.size > 0) return blob
    }
  } catch {
    // fallback to next
  }

  // 3. Fallback direct google thumbnail
  try {
    const res = await fetch(targetGoogleUrl)
    if (res.ok) {
      const blob = await res.blob()
      if (blob && blob.size > 0) return blob
    }
  } catch {
    // fallback to next
  }

  // 4. Fallback direct lh3
  try {
    const lh3Url = `https://lh3.googleusercontent.com/d/${fileId}=w2500`
    const res = await fetch(lh3Url)
    if (res.ok) {
      const blob = await res.blob()
      if (blob && blob.size > 0) return blob
    }
  } catch {
    // ignore
  }

  return null
}

/**
 * Trigger download for a single Google Drive file
 * Uses drive.usercontent.google.com direct download or drive.google.com/uc
 */
export function triggerDirectDownload(fileId, filename = '') {
  // Use direct usercontent download link which opens Google Drive's native direct download stream
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`
  
  const a = document.createElement('a')
  a.href = url
  if (filename) {
    a.download = filename
  }
  // Omitting target='_blank' or letting browser handle download intent works reliably on Mobile Chrome/Safari
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
  }, 100)
}
