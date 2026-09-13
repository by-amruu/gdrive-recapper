<template>
  <div class="neo-card p-5 space-y-4">
    
    <!-- Title & Mode Toggle -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-zinc-900 pb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-md bg-cyan-300 border-2 border-zinc-900 shadow-neo-sm flex items-center justify-center font-bold text-sm">
          +
        </div>
        <div>
          <h2 class="font-extrabold text-sm text-zinc-900">Input Folder atau File Google Drive</h2>
          <p class="text-[11px] text-zinc-500 font-medium">Bisa tempel 1 atau banyak link folder sekaligus</p>
        </div>
      </div>

      <!-- Multi-folder Append / Replace Mode Switcher -->
      <div v-if="gallery.totalCount > 0" class="flex items-center gap-1.5 bg-zinc-100 p-1 border border-zinc-900 rounded-md">
        <span class="text-[10px] font-bold text-zinc-500 pl-1">Jika ada folder baru:</span>
        <button
          @click="importMode = 'append'"
          :class="[
            'px-2 py-0.5 text-[10px] font-extrabold rounded transition-all',
            importMode === 'append' ? 'bg-amber-300 text-zinc-900 border border-zinc-900 shadow-neo-sm' : 'text-zinc-600 hover:text-zinc-900'
          ]"
          title="Gabungkan foto dari folder baru dengan foto yang sudah ada"
        >
          ➕ Gabung
        </button>
        <button
          @click="importMode = 'replace'"
          :class="[
            'px-2 py-0.5 text-[10px] font-extrabold rounded transition-all',
            importMode === 'replace' ? 'bg-rose-300 text-zinc-900 border border-zinc-900 shadow-neo-sm' : 'text-zinc-600 hover:text-zinc-900'
          ]"
          title="Ganti isi galeri sepenuhnya dengan folder baru"
        >
          🔄 Ganti
        </button>
      </div>
    </div>

    <!-- Main Input Form with Multi-line Support -->
    <div class="space-y-3">
      <div class="relative">
        <textarea
          v-model="inputUrl"
          @keydown.enter.ctrl="handleSubmit"
          rows="2"
          placeholder="Paste link Google Drive di sini (bisa multi-link folder/file, satu link per baris)..."
          class="neo-input resize-none text-xs leading-relaxed font-mono py-2.5"
        />
        
        <div class="absolute bottom-2.5 right-2 flex items-center gap-2">
          <kbd class="hidden sm:inline-block text-[10px] bg-zinc-100 text-zinc-500 font-mono border border-zinc-900 rounded px-1.5 py-0.5">
            Ctrl + Enter
          </kbd>
        </div>
      </div>

      <!-- Action Row -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        
        <!-- Examples -->
        <div class="flex items-center gap-1.5 flex-wrap text-[11px]">
          <span class="font-bold text-zinc-400">Contoh:</span>
          <button
            @click="inputUrl = sampleFolder"
            class="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-900 rounded font-semibold text-zinc-800 transition-colors"
          >
            📁 Folder Dokumentasi
          </button>
          <button
            @click="inputUrl = sampleFile"
            class="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-900 rounded font-semibold text-zinc-800 transition-colors"
          >
            🖼️ File Tunggal
          </button>
        </div>

        <!-- Submit Button -->
        <button
          @click="handleSubmit"
          :disabled="!inputUrl.trim() || isLoading"
          class="btn-neo-primary px-6 py-2.5 text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading" class="animate-spin text-sm">⏳</span>
          <span v-else class="text-sm">⚡</span>
          <span>{{ isLoading ? loadingStatus : (importMode === 'append' && gallery.totalCount > 0 ? 'Gabungkan ke Galeri' : 'Muat ke Galeri') }}</span>
        </button>

      </div>
    </div>

    <!-- Alert / Message banner -->
    <transition name="fade">
      <div
        v-if="feedbackMsg"
        :class="[
          'p-3 rounded-neo border-2 border-zinc-900 text-xs font-semibold flex items-start justify-between gap-2 shadow-neo-sm',
          feedbackType === 'error' ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'
        ]"
      >
        <div class="flex items-center gap-2">
          <span>{{ feedbackType === 'error' ? '⚠️' : '✅' }}</span>
          <span>{{ feedbackMsg }}</span>
        </div>
        <button @click="feedbackMsg = ''" class="font-bold hover:opacity-75">✕</button>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGalleryStore } from '@/stores/gallery'
import { extractFileId, isFolderUrl, fetchFolderContents } from '@/utils/gdrive'

const gallery = useGalleryStore()
const inputUrl = ref('')
const isLoading = ref(false)
const loadingStatus = ref('Memproses Cepat...')
const feedbackMsg = ref('')
const feedbackType = ref('success')
const importMode = ref('append') // 'append' | 'replace'

const sampleFolder = 'https://drive.google.com/drive/folders/1442u65M5KQasSlrQV2dMgAaZto0veLO0'
const sampleFile = 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/view'

async function handleSubmit() {
  feedbackMsg.value = ''
  const text = inputUrl.value.trim()
  if (!text) return

  // Parse multi-lines
  const lines = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
  if (lines.length === 0) return

  isLoading.value = true
  loadingStatus.value = 'Mempersiapkan link...'

  let totalAdded = 0
  let folderNames = []
  let errors = []

  // Check if any folder requires API Key
  const hasFolder = lines.some(l => isFolderUrl(l))
  if (hasFolder && !gallery.apiKey) {
    isLoading.value = false
    gallery.showModal({
      title: 'API Key Diperlukan',
      message: 'Google Drive API Key belum disetel. Hubungi administrator repository atau setel VITE_GDRIVE_API_KEY.',
      icon: '🔑',
      confirmText: 'Buka Input Manual',
      onConfirm: () => {
        gallery.isSettingsOpen = true
      }
    })
    return
  }

  // If mode is 'replace' and user is loading a fresh batch, clear current gallery first
  if (importMode.value === 'replace') {
    gallery.clearAll()
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const id = extractFileId(line)
    if (!id) {
      errors.push(`URL tidak valid: ${line.slice(0, 30)}...`)
      continue
    }

    if (isFolderUrl(line)) {
      loadingStatus.value = `Mengambil isi folder (${i + 1}/${lines.length})...`
      try {
        const { folderName, items } = await fetchFolderContents(id, gallery.apiKey)
        if (items.length > 0) {
          const added = gallery.addItems(items, 'append')
          totalAdded += added
          folderNames.push(folderName)
          if (gallery.folderStack.length === 0) {
            gallery.folderStack = [{ id, name: folderName }]
          }
        }
      } catch (err) {
        errors.push(err.message || `Gagal memuat folder ${id}`)
      }
    } else {
      // Single file
      const added = gallery.addSingleUrl(line)
      totalAdded += added
    }
  }

  isLoading.value = false

  if (totalAdded > 0) {
    feedbackType.value = 'success'
    const folderDesc = folderNames.length > 0 ? ` dari ${folderNames.length} folder (${folderNames.join(', ')})` : ''
    feedbackMsg.value = `Berhasil memuat & menggabungkan ${totalAdded} item baru${folderDesc}! Total galeri: ${gallery.totalCount} media.`
    inputUrl.value = ''
  } else if (errors.length > 0) {
    feedbackType.value = 'error'
    feedbackMsg.value = errors.join('; ')
  } else {
    feedbackType.value = 'error'
    feedbackMsg.value = 'Semua file dari link tersebut sudah ada di galeri (duplikat).'
  }
}
</script>
