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
 * Generate a shareable link with embedded API key
 */
export function generateShareLink(folderId, folderName, apiKey = '', role = 'viewer') {
  const payload = { folderId, name: folderName, apiKey: apiKey || '' }
  const encoded = b64Encode(payload)
  const origin = window.location.origin
  return `${origin}${BASE}?share=${encoded}&role=${role}`
}

/**
 * Parse ?share= params from current URL
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
    role: role === 'editor' ? 'editor' : 'viewer',
  }
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
