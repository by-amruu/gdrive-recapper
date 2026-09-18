/**
 * sharelink.js — Shareable read-only/editor link system
 *
 * URL Format:  ?share=BASE64URL&role=viewer|editor
 * Payload:     { folderId, name }
 *
 * SECURITY: API Key is NEVER included in the share link payload.
 * The person opening the link must have their own API Key configured.
 */

const BASE = '/ukm-gallery-picker/'

function b64Encode(obj) {
  const json = JSON.stringify(obj)
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function b64Decode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const padLen = (4 - padded.length % 4) % 4
  const b64 = padded + '='.repeat(padLen)
  try {
    return JSON.parse(decodeURIComponent(escape(atob(b64))))
  } catch {
    return null
  }
}

/**
 * Generate a concise shareable link.
 * If the environment API key matches, we only need ?f=FOLDER_ID (super short!).
 * If a specific custom apiKey is provided and differs from env, we encode compactly.
 */
export function generateShareLink(folderId, folderName, apiKey = '', role = 'viewer') {
  const origin = window.location.origin
  const envKey = import.meta.env.VITE_GDRIVE_API_KEY || ''

  // If apiKey is empty or matches the site's environment key,
  // we can create an ultra-clean & short link: ?f=<folderId>
  if (!apiKey || apiKey === envKey) {
    const params = new URLSearchParams()
    params.set('f', folderId)
    if (folderName && folderName !== 'Folder' && folderName !== 'Dokumentasi') {
      params.set('n', folderName)
    }
    if (role && role !== 'viewer') {
      params.set('r', role)
    }
    return `${origin}${BASE}?${params.toString()}`
  }

  // Compact payload: [folderId, folderName, apiKey, role]
  const payload = [folderId, folderName || '', apiKey, role || 'viewer']
  const encoded = b64Encode(payload)
  return `${origin}${BASE}?s=${encoded}`
}

/**
 * Parse share params from current URL.
 * Supports:
 * 1. Ultra-short format: ?f=<folderId>&n=<folderName>&r=<role>
 * 2. Compact base64 format: ?s=<encoded>
 * 3. Legacy base64 format: ?share=<encoded>&role=<role>
 */
export function parseShareLink() {
  const params = new URLSearchParams(window.location.search)

  // 1. Ultra-short format (?f=...)
  if (params.has('f')) {
    const folderId = params.get('f')
    if (!folderId) return null
    const name = params.get('n') || 'Folder Dibagikan'
    const role = params.get('r') === 'editor' ? 'editor' : 'viewer'
    return {
      folderId,
      name,
      apiKey: '', // Will use VITE_GDRIVE_API_KEY directly from environment
      role,
    }
  }

  // 2. Compact base64 format (?s=...)
  if (params.has('s')) {
    const raw = params.get('s')
    const decoded = b64Decode(raw)
    if (Array.isArray(decoded) && decoded[0]) {
      return {
        folderId: decoded[0],
        name: decoded[1] || 'Folder Dibagikan',
        apiKey: decoded[2] || '',
        role: decoded[3] === 'editor' ? 'editor' : 'viewer',
      }
    }
    if (decoded && decoded.folderId) {
      return {
        folderId: decoded.folderId,
        name: decoded.name || 'Folder Dibagikan',
        apiKey: decoded.apiKey || '',
        role: decoded.role === 'editor' ? 'editor' : 'viewer',
      }
    }
  }

  // 3. Legacy format (?share=...)
  const encoded = params.get('share')
  if (encoded) {
    const role = params.get('role') || 'viewer'
    const payload = b64Decode(encoded)
    if (payload && payload.folderId) {
      return {
        folderId: payload.folderId,
        name: payload.name || 'Folder Dibagikan',
        apiKey: payload.apiKey || '',
        role: role === 'editor' ? 'editor' : 'viewer',
      }
    }
  }

  return null
}

/** Copy text to clipboard */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    el.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  }
}
