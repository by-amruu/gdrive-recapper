<template>
  <div class="neo-card p-5 space-y-4">
    
    <!-- Title -->
    <div class="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-md bg-cyan-300 border-2 border-zinc-900 shadow-neo-sm flex items-center justify-center font-bold text-sm">
          +
        </div>
        <div>
          <h2 class="font-extrabold text-sm text-zinc-900">Buka Folder Baru (Buka di Window Tab Baru)</h2>
          <p class="text-[11px] text-zinc-500 font-medium">Setiap link folder Google Drive akan otomatis dibuka di tab window tersendiri</p>
        </div>
      </div>
    </div>

    <!-- Main Input Form with Multi-line Support -->
    <div class="space-y-3">
      <div class="relative">
        <textarea
          v-model="inputUrl"
          @keydown.enter.ctrl="handleSubmit"
          rows="2"
          placeholder="Paste link Google Drive di sini (bisa multi-link, setiap link folder akan dibuka di tab baru)..."
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
          <span v-else class="text-sm">🗂️</span>
          <span>{{ isLoading ? loadingStatus : 'Buka di Tab Baru' }}</span>
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
const loadingStatus = ref('Memproses...')
const feedbackMsg = ref('')
const feedbackType = ref('success')

const sampleFolder = 'https://drive.google.com/drive/folders/1442u65M5KQasSlrQV2dMgAaZto0veLO0'
const sampleFile = 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/view'

async function handleSubmit() {
  feedbackMsg.value = ''
  const text = inputUrl.value.trim()
  if (!text) return

  const lines = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
  if (lines.length === 0) return

  // Check API Key if folder included
  const hasFolder = lines.some(l => isFolderUrl(l))
  if (hasFolder && !gallery.apiKey) {
    gallery.showModal({
      title: 'API Key Diperlukan',
      message: 'Google Drive API Key belum disetel. Buka menu input API Key untuk mengonfigurasi.',
      icon: '🔑',
      confirmText: 'Buka Input Manual',
      onConfirm: () => {
        gallery.isSettingsOpen = true
      }
    })
    return
  }

  isLoading.value = true
  let tabsCreated = 0
  let errors = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const id = extractFileId(line)
    if (!id) {
      errors.push(`URL tidak valid: ${line.slice(0, 30)}...`)
      continue
    }

    if (isFolderUrl(line)) {
      loadingStatus.value = `Membuka tab folder (${i + 1}/${lines.length})...`
      try {
        const { folderName, items } = await fetchFolderContents(id, gallery.apiKey)
        gallery.createTab(id, folderName || `Folder ${id.slice(0, 6)}`, items)
        tabsCreated++
      } catch (err) {
        errors.push(err.message || `Gagal memuat folder ${id}`)
      }
    } else {
      // Single file added to active tab (or new tab if none)
      const added = gallery.addSingleUrl(line)
      if (added > 0) tabsCreated++
    }
  }

  isLoading.value = false

  if (tabsCreated > 0) {
    feedbackType.value = 'success'
    feedbackMsg.value = `Berhasil membuka ${tabsCreated} tab folder baru!`
    inputUrl.value = ''
  } else if (errors.length > 0) {
    feedbackType.value = 'error'
    feedbackMsg.value = errors.join('; ')
  }
}
</script>
