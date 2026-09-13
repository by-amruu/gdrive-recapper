/**
 * gdrive.js — Google Drive URL parsing, REST API v3 & Folder Navigation
 */

/**
 * Extract Google Drive file or folder ID from various URL formats
 */
export function extractFileId(url) {
  if (!url || typeof url !== 'string') return null
  url = url.trim()

  // Raw ID (alphanumeric with - and _, typically 25-50 chars)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(url)) return url

  // /file/d/{ID}/
  let m = url.match(/\/file\/d\/([a-zA-Z0-9_-]{25,50})/)
  if (m) return m[1]

  // /drive/folders/{ID}
  m = url.match(/\/drive\/folders\/([a-zA-Z0-9_-]{25,50})/)
  if (m) return m[1]

  // /folders/{ID}
  m = url.match(/\/folders\/([a-zA-Z0-9_-]{25,50})/)
  if (m) return m[1]

  // /d/{ID}/
  m = url.match(/\/d\/([a-zA-Z0-9_-]{25,50})/)
  if (m) return m[1]

  // ?id={ID} or &id={ID}
  m = url.match(/[?&]id=([a-zA-Z0-9_-]{25,50})/)
  if (m) return m[1]

  // open?id={ID}
  m = url.match(/open\?id=([a-zA-Z0-9_-]{25,50})/)
  if (m) return m[1]

  return null
}

/** Check if URL is specifically a Google Drive folder link */
export function isFolderUrl(url) {
  if (!url || typeof url !== 'string') return false
  return url.includes('/folders/') || url.includes('embeddedfolderview')
}

/** Direct download URL format for files */
export function toDownloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

/**
 * Build multiple fallback thumbnail URLs for Google Drive files
 * 1. lh3.googleusercontent.com (very reliable for public Drive files, renders even HEIC converted thumbnails)
 * 2. drive.google.com/thumbnail?id=...
 */
export function toThumbnailUrl(fileId) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`
}

export function toHighResPreviewUrl(fileId) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`
}

/** Detect media type */
export function detectType(nameOrUrl = '') {
  const lower = nameOrUrl.toLowerCase()
  const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.m4v', '.wmv', '.3gp']
  const photoExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.bmp', '.tiff', '.svg', '.avif', '.raw', '.cr2', '.nef']

  for (const ext of videoExts) if (lower.includes(ext)) return 'video'
  for (const ext of photoExts) if (lower.includes(ext)) return 'photo'
  if (lower.includes('video') || lower.includes('mp4')) return 'video'
  return 'photo'
}

/**
 * Fetch files and subfolders inside a Google Drive folder using Google Drive API v3
 * @param {string} folderId
 * @param {string} apiKey
 * @returns {Promise<{folderName: string, items: Array}>}
 */
export async function fetchFolderContents(folderId, apiKey) {
  if (!folderId || !apiKey) {
    throw new Error('Folder ID dan API Key diperlukan.')
  }

  // 1. Get folder metadata (name)
  let folderName = 'Folder Dokumentasi'
  try {
    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=name&key=${apiKey}`)
    if (metaRes.ok) {
      const metaData = await metaRes.json()
      if (metaData.name) folderName = metaData.name
    }
  } catch (e) {
    // ignore
  }

  // 2. Query all children (files + subfolders)
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`)
  const fields = encodeURIComponent('files(id, name, mimeType, size, thumbnailLink, webContentLink, imageMediaMetadata, videoMediaMetadata)')
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=1000&orderBy=folder,name&key=${apiKey}`

  const response = await fetch(url)
  const data = await response.json()

  if (!response.ok) {
    const errorMsg = data.error?.message || 'Gagal mengambil isi folder dari Google Drive API.'
    throw new Error(errorMsg)
  }

  const files = data.files || []
  const items = files.map(file => {
    const isFolder = file.mimeType === 'application/vnd.google-apps.folder'
    const isVideo = file.mimeType?.startsWith('video/')
    const inferredType = isFolder ? 'folder' : (isVideo ? 'video' : detectType(file.name))

    // If Google Drive API returned a thumbnailLink, prioritize it because it contains the exact signed lh3 token!
    // We replace the =s220 with =w600 for high resolution thumbnail
    let thumbUrl = ''
    let highResUrl = ''
    if (file.thumbnailLink) {
      thumbUrl = file.thumbnailLink.replace(/=s\d+/, '=w600')
      highResUrl = file.thumbnailLink.replace(/=s\d+/, '=w2048')
    } else {
      thumbUrl = toThumbnailUrl(file.id)
      highResUrl = toHighResPreviewUrl(file.id)
    }

    return {
      id: file.id,
      name: file.name,
      label: file.name,
      mimeType: file.mimeType,
      size: file.size ? formatFileSize(file.size) : null,
      type: inferredType,
      isFolder,
      rawUrl: isFolder ? `https://drive.google.com/drive/folders/${file.id}` : `https://drive.google.com/file/d/${file.id}/view`,
      downloadUrl: toDownloadUrl(file.id),
      thumbUrl,
      highResUrl,
      apiThumbnail: file.thumbnailLink || null,
      iframePreviewUrl: isFolder
        ? `https://drive.google.com/embeddedfolderview?id=${file.id}#grid`
        : `https://drive.google.com/file/d/${file.id}/preview`,
      addedAt: Date.now(),
    }
  })

  return {
    folderName,
    items
  }
}

/** Helper to format bytes into readable size */
export function formatFileSize(bytes) {
  const num = parseInt(bytes, 10)
  if (isNaN(num) || num <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(num) / Math.log(1024))
  return `${(num / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}
