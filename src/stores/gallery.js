import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { extractFileId, isFolderUrl, toDownloadUrl, toThumbnailUrl, toHighResPreviewUrl, detectType, fetchFolderContents } from '@/utils/gdrive'

const TABS_STORAGE_KEY = 'gdrive-folder-tabs-v1'
const API_KEY_STORAGE = 'gdrive-api-key'

const envApiKey = import.meta.env.VITE_GDRIVE_API_KEY || ''

export const useGalleryStore = defineStore('gallery', () => {
  // ─── State ────────────────────────────────────────────────
  // List of Folder Tabs: [{ id, name, items: [], selectedIds: [], folderStack: [] }]
  const tabs = ref(loadTabsFromStorage())
  const activeTabId = ref(tabs.value.length > 0 ? tabs.value[0].id : null)

  const apiKey = ref(envApiKey || localStorage.getItem(API_KEY_STORAGE) || '')
  const activeItem = ref(null)
  const compareA = ref(null)
  const compareB = ref(null)

  // Infinite scroll: Jumlah item yang dirender saat ini
  const visibleCount = ref(36)
  const PAGE_CHUNK = 24

  const isNavigatingFolder = ref(false)

  // UI state
  const filter = ref('all') // 'all' | 'folder' | 'photo' | 'video'
  const viewMode = ref('grid') // 'grid' | 'splitscreen'
  const sortOrder = ref('newest') // 'newest' | 'oldest' | 'name'
  const isSettingsOpen = ref(false)

  // Modal Dialog State
  const dialog = ref({
    isOpen: false,
    title: '',
    message: '',
    icon: 'ℹ️',
    confirmText: 'OK',
    cancelText: 'Batal',
    showCancel: false,
    isDanger: false,
    onConfirm: null,
    onCancel: null,
  })

  // ─── Active Tab Getters & Setters ─────────────────────────
  const currentTab = computed(() => {
    return tabs.value.find(t => t.id === activeTabId.value) || null
  })

  const items = computed(() => {
    return currentTab.value ? currentTab.value.items : []
  })

  const selectedIds = computed({
    get() {
      return currentTab.value ? currentTab.value.selectedIds : []
    },
    set(newVal) {
      if (currentTab.value) {
        currentTab.value.selectedIds = newVal
        saveTabsToStorage()
      }
    }
  })

  const folderStack = computed({
    get() {
      return currentTab.value ? currentTab.value.folderStack : []
    },
    set(newVal) {
      if (currentTab.value) {
        currentTab.value.folderStack = newVal
        saveTabsToStorage()
      }
    }
  })

  const currentFolderName = computed(() => {
    if (folderStack.value.length === 0) return currentTab.value?.name || ''
    return folderStack.value[folderStack.value.length - 1].name
  })

  // ─── Computed Filters & Sorting ───────────────────────────
  const filteredItems = computed(() => {
    let list = [...items.value]

    if (filter.value !== 'all') {
      list = list.filter(item => item.type === filter.value)
    }

    if (sortOrder.value === 'newest') {
      list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
    } else if (sortOrder.value === 'oldest') {
      list.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0))
    } else if (sortOrder.value === 'name') {
      list.sort((a, b) => (a.name || a.label || '').localeCompare(b.name || b.label || ''))
    }

    return list
  })

  const visibleItems = computed(() => {
    return filteredItems.value.slice(0, visibleCount.value)
  })

  const hasMoreItems = computed(() => {
    return visibleCount.value < filteredItems.value.length
  })

  const folderCount = computed(() => items.value.filter(i => i.isFolder || i.type === 'folder').length)
  const photoCount = computed(() => items.value.filter(i => i.type === 'photo').length)
  const videoCount = computed(() => items.value.filter(i => i.type === 'video').length)
  const totalCount = computed(() => items.value.length)
  const selectedCount = computed(() => selectedIds.value.length)
  const isAllSelected = computed(() => {
    const selectable = filteredItems.value.filter(i => !i.isFolder)
    if (selectable.length === 0) return false
    return selectable.every(i => selectedIds.value.includes(i.id))
  })

  const selectedItems = computed(() => {
    return items.value.filter(i => selectedIds.value.includes(i.id))
  })

  const activeIndex = computed(() => {
    if (!activeItem.value) return -1
    return filteredItems.value.findIndex(i => i.id === activeItem.value.id)
  })

  // ─── Dialog Actions ───────────────────────────────────────
  function showModal({ title, message, icon = 'ℹ️', confirmText = 'OK', cancelText = 'Batal', showCancel = false, isDanger = false, onConfirm, onCancel }) {
    dialog.value = {
      isOpen: true,
      title,
      message,
      icon,
      confirmText,
      cancelText,
      showCancel,
      isDanger,
      onConfirm: onConfirm || null,
      onCancel: onCancel || null,
    }
  }

  function closeModal() {
    dialog.value.isOpen = false
  }

  // ─── Tab Management ───────────────────────────────────────
  function createTab(folderId, folderName, initialItems = []) {
    // Check if tab already exists
    const existing = tabs.value.find(t => t.id === folderId)
    if (existing) {
      activeTabId.value = existing.id
      existing.items = initialItems
      resetVisibleCount()
      saveTabsToStorage()
      return existing
    }

    const newTab = {
      id: folderId,
      name: folderName || `Tab ${tabs.value.length + 1}`,
      items: initialItems,
      selectedIds: [],
      folderStack: [{ id: folderId, name: folderName }]
    }

    tabs.value.push(newTab)
    activeTabId.value = newTab.id
    resetVisibleCount()
    saveTabsToStorage()
    return newTab
  }

  function switchTab(tabId) {
    activeTabId.value = tabId
    resetVisibleCount()
  }

  function closeTab(tabId) {
    const idx = tabs.value.findIndex(t => t.id === tabId)
    if (idx === -1) return

    tabs.value.splice(idx, 1)
    if (activeTabId.value === tabId) {
      if (tabs.value.length > 0) {
        activeTabId.value = tabs.value[Math.max(0, idx - 1)].id
      } else {
        activeTabId.value = null
      }
    }
    resetVisibleCount()
    saveTabsToStorage()
  }

  // ─── Infinite Scroll Action ───────────────────────────────
  function loadMore() {
    if (hasMoreItems.value) {
      visibleCount.value = Math.min(visibleCount.value + PAGE_CHUNK, filteredItems.value.length)
    }
  }

  function resetVisibleCount() {
    visibleCount.value = 36
  }

  // ─── Actions ──────────────────────────────────────────────
  function setApiKey(key) {
    apiKey.value = key.trim()
    localStorage.setItem(API_KEY_STORAGE, apiKey.value)
  }

  function addSingleUrl(url, manualType = null) {
    const id = extractFileId(url)
    if (!id) return 0

    // If no tab exists, create default tab
    if (!currentTab.value) {
      createTab('default-session', 'Dokumentasi', [])
    }

    if (currentTab.value.items.some(i => i.id === id)) return 0

    const isFolder = isFolderUrl(url)
    const type = manualType || (isFolder ? 'folder' : detectType(url))

    const newItem = {
      id,
      name: `File ${id.slice(0, 8)}`,
      label: `File ${id.slice(0, 8)}`,
      type,
      isFolder,
      rawUrl: url,
      downloadUrl: toDownloadUrl(id),
      thumbUrl: toThumbnailUrl(id),
      highResUrl: toHighResPreviewUrl(id),
      iframePreviewUrl: isFolder
        ? `https://drive.google.com/embeddedfolderview?id=${id}#grid`
        : `https://drive.google.com/file/d/${id}/preview`,
      addedAt: Date.now()
    }

    currentTab.value.items.push(newItem)
    saveTabsToStorage()
    return 1
  }

  function removeItem(id) {
    if (!currentTab.value) return
    currentTab.value.items = currentTab.value.items.filter(i => i.id !== id)
    currentTab.value.selectedIds = currentTab.value.selectedIds.filter(sId => sId !== id)
    if (activeItem.value?.id === id) activeItem.value = null
    if (compareA.value?.id === id) compareA.value = null
    if (compareB.value?.id === id) compareB.value = null
    saveTabsToStorage()
  }

  function clearCurrentTab() {
    if (!currentTab.value) return
    currentTab.value.items = []
    currentTab.value.selectedIds = []
    currentTab.value.folderStack = []
    activeItem.value = null
    compareA.value = null
    compareB.value = null
    resetVisibleCount()
    saveTabsToStorage()
  }

  function clearAll() {
    tabs.value = []
    activeTabId.value = null
    activeItem.value = null
    compareA.value = null
    compareB.value = null
    resetVisibleCount()
    saveTabsToStorage()
  }

  /** Hapus Cache Mutlak */
  function clearAbsoluteCache() {
    localStorage.clear()
    sessionStorage.clear()
    tabs.value = []
    activeTabId.value = null
    activeItem.value = null
    compareA.value = null
    compareB.value = null
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name))
      })
    }
    window.location.reload()
  }

  // ─── Subfolder Navigation inside active tab ───────────────
  async function enterSubfolder(folderItem) {
    if (!apiKey.value) {
      showModal({
        title: 'Kunci API Diperlukan',
        message: 'Silakan masukkan Google Drive API Key pada menu pengaturan untuk menjelajahi subdirektori.',
        icon: '🔑',
        confirmText: 'Buka Pengaturan',
        onConfirm: () => {
          isSettingsOpen.value = true
        }
      })
      return
    }

    isNavigatingFolder.value = true
    try {
      const { folderName, items: folderItems } = await fetchFolderContents(folderItem.id, apiKey.value)
      if (currentTab.value) {
        currentTab.value.folderStack.push({
          id: folderItem.id,
          name: folderItem.name || folderName || 'Subdirektori'
        })
        currentTab.value.items = folderItems
        currentTab.value.selectedIds = []
      }
      resetVisibleCount()
      saveTabsToStorage()
    } catch (e) {
      showModal({
        title: 'Gagal Membuka Subdirektori',
        message: e.message || 'Terjadi kendala saat memuat isi subdirektori.',
        icon: '❌'
      })
    } finally {
      isNavigatingFolder.value = false
    }
  }

  async function goToBreadcrumb(index) {
    if (index === folderStack.value.length - 1) return
    const target = folderStack.value[index]
    isNavigatingFolder.value = true
    try {
      const { items: folderItems } = await fetchFolderContents(target.id, apiKey.value)
      if (currentTab.value) {
        currentTab.value.folderStack = currentTab.value.folderStack.slice(0, index + 1)
        currentTab.value.items = folderItems
        currentTab.value.selectedIds = []
      }
      resetVisibleCount()
      saveTabsToStorage()
    } catch (e) {
      showModal({
        title: 'Gagal Navigasi Direktori',
        message: e.message || 'Tidak dapat memuat direktori sebelumnya.',
        icon: '❌'
      })
    } finally {
      isNavigatingFolder.value = false
    }
  }

  // ─── Selection Actions ────────────────────────────────────
  function toggleSelect(id) {
    if (!currentTab.value) return
    if (currentTab.value.selectedIds.includes(id)) {
      currentTab.value.selectedIds = currentTab.value.selectedIds.filter(sId => sId !== id)
    } else {
      currentTab.value.selectedIds.push(id)
    }
    saveTabsToStorage()
  }

  function selectAll() {
    if (!currentTab.value) return
    const ids = filteredItems.value.filter(i => !i.isFolder).map(i => i.id)
    currentTab.value.selectedIds = Array.from(new Set([...currentTab.value.selectedIds, ...ids]))
    saveTabsToStorage()
  }

  function deselectAll() {
    if (!currentTab.value) return
    currentTab.value.selectedIds = []
    saveTabsToStorage()
  }

  // ─── Preview navigation ───────────────────────────────────
  function openPreview(item) {
    if (item.isFolder) {
      enterSubfolder(item)
      return
    }
    activeItem.value = item
  }

  function closePreview() {
    activeItem.value = null
  }

  function prevItem() {
    const idx = activeIndex.value
    if (idx > 0) activeItem.value = filteredItems.value[idx - 1]
  }

  function nextItem() {
    const idx = activeIndex.value
    if (idx < filteredItems.value.length - 1) {
      activeItem.value = filteredItems.value[idx + 1]
    }
  }

  // ─── Split Screen ─────────────────────────────────────────
  function setCompareA(item) { compareA.value = item }
  function setCompareB(item) { compareB.value = item }
  function swapCompare() {
    const temp = compareA.value
    compareA.value = compareB.value
    compareB.value = temp
  }
  function clearCompare() {
    compareA.value = null
    compareB.value = null
  }

  // ─── Storage Helpers ──────────────────────────────────────
  function saveTabsToStorage() {
    try {
      localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs.value))
    } catch {
      // ignore
    }
  }

  function loadTabsFromStorage() {
    try {
      const raw = localStorage.getItem(TABS_STORAGE_KEY)
      if (raw) return JSON.parse(raw)
      
      // Migration from old single-item storage if present
      const oldRaw = localStorage.getItem('gdrive-gallery-v3')
      if (oldRaw) {
        const oldItems = JSON.parse(oldRaw)
        if (oldItems && oldItems.length > 0) {
          return [{
            id: 'tab-default',
            name: 'Dokumentasi Acara',
            items: oldItems,
            selectedIds: [],
            folderStack: [{ id: 'tab-default', name: 'Dokumentasi Acara' }]
          }]
        }
      }
      return []
    } catch {
      return []
    }
  }

  return {
    tabs, activeTabId, currentTab, items, apiKey, activeItem, compareA, compareB, selectedIds, filter, viewMode, sortOrder, isSettingsOpen, dialog,
    visibleCount, visibleItems, hasMoreItems,
    folderStack, isNavigatingFolder, currentFolderName,
    filteredItems, folderCount, photoCount, videoCount, totalCount, selectedCount, isAllSelected, selectedItems, activeIndex,
    setApiKey, createTab, switchTab, closeTab, addSingleUrl, removeItem, clearCurrentTab, clearAll, clearAbsoluteCache, enterSubfolder, goToBreadcrumb,
    showModal, closeModal, loadMore, resetVisibleCount,
    toggleSelect, selectAll, deselectAll,
    openPreview, closePreview, prevItem, nextItem,
    setCompareA, setCompareB, swapCompare, clearCompare,
  }
})
