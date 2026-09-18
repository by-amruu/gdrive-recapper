/**
 * sharelink.js — Shareable link system for GDrive Media Recapper
 * 
 * URL Format:
 *   ?share=ENCODED_PAYLOAD&role=viewer|editor
 * 
 * Payload (JSON → base64url):
 *   { folderId: string, name?: string, apiKey?: string }
 * 
 * Roles:
 *   viewer  — Can browse, preview, select & download. Cannot add/remove tabs.
 *   editor  — Full access (same as direct session). Default for owner.
 */

const BASE = '/ukm-gallery-picker/'

/** Encode payload into base64url */
function b64Encode(obj) {
  const json = JSON.stringify(obj)
  // Use btoa with safe chars
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** Decode base64url payload */
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
 * Generate a shareable link for a folder
 * @param {string} folderId  - Google Drive folder ID
 * @param {string} folderName - Display name
 * @param {string} apiKey - Google Drive API key to embed (optional, viewer can use their own)
 * @param {'viewer'|'editor'} role
 * @returns {string} full absolute URL
 */
export function generateShareLink(folderId, folderName, apiKey = '', role = 'viewer') {
  const payload = { folderId, name: folderName }
  if (apiKey) payload.apiKey = apiKey
  
  const encoded = b64Encode(payload)
  const origin = window.location.origin
  return `${origin}${BASE}?share=${encoded}&role=${role}`
}

/**
 * Parse share params from current URL
 * @returns {{ folderId: string, name: string, apiKey: string, role: 'viewer'|'editor' } | null}
 */
export function parseShareLink() {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get('share')
  const role = params.get('role') || 'viewer'
  
  if (!encoded) return null
  
  const payload = b64Decode(encoded)
  if (!payload || !payload.folderId) return null
  
  return {
    folderId: payload.folderId,
    name: payload.name || 'Folder Dibagikan',
    apiKey: payload.apiKey || '',
    role: role === 'editor' ? 'editor' : 'viewer'
  }
}

/** Copy text to clipboard with fallback */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  }
}
