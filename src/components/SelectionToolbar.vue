<template>
  <transition name="slide-up">
    <div
      v-if="gallery.selectedCount > 0"
      class="fixed bottom-4 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-2xl w-full sm:w-auto"
    >
      <div class="neo-card bg-zinc-900 text-white px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-neo-lg border-2 border-zinc-900">
        
        <!-- Left: Selected Count & Deselect -->
        <div class="flex items-center gap-2.5">
          <span class="w-7 h-7 rounded-full bg-amber-400 text-zinc-900 font-extrabold text-sm flex items-center justify-center flex-shrink-0">
            {{ gallery.selectedCount }}
          </span>
          <span class="text-sm font-bold tracking-tight">Berkas Dipilih</span>
          <button
            @click="gallery.deselectAll"
            class="text-xs text-zinc-400 hover:text-white underline ml-1 touch-manipulation"
          >
            Batalkan
          </button>
        </div>

        <!-- Right: Download Action Buttons -->
        <div class="flex items-center gap-2 justify-stretch sm:justify-end">
          
          <!-- Download ZIP Button -->
          <button
            @click="handleDownloadZip"
            :disabled="isZipping"
            class="btn-neo bg-amber-400 hover:bg-amber-300 text-zinc-900 text-xs px-4 py-2.5 sm:py-2 flex items-center justify-center gap-1.5 flex-1 sm:flex-initial touch-manipulation"
          >
            <span v-if="isZipping" class="animate-spin text-xs">⏳</span>
            <span v-else>📦</span>
            <span>{{ isZipping ? zipProgress : 'Unduh .ZIP' }}</span>
          </button>

          <!-- Download Files Individually -->
          <button
            @click="handleDownloadIndividual"
            class="btn-neo bg-cyan-300 hover:bg-cyan-400 text-zinc-900 text-xs px-4 py-2.5 sm:py-2 flex items-center justify-center gap-1.5 flex-1 sm:flex-initial touch-manipulation"
            title="Unduh berkas terpilih satu per satu"
          >
            <span>⬇️</span>
            <span>Unduh Satu-satu</span>
          </button>

        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import { useGalleryStore } from '@/stores/gallery'
import JSZip from 'jszip'
import { fetchMediaBlob, triggerDirectDownload } from '@/utils/downloader'

const gallery = useGalleryStore()
const isZipping = ref(false)
const zipProgress = ref('')

async function handleDownloadZip() {
  if (gallery.selectedItems.length === 0) return
  isZipping.value = true
  zipProgress.value = 'Mempersiapkan...'

  const zip = new JSZip()
  const items = gallery.selectedItems.filter(i => !i.isFolder)
  const total = items.length

  if (total === 0) {
    gallery.showModal({
      title: 'Pilihan Tidak Valid',
      message: 'Tidak ada berkas media (foto/video) yang terpilih untuk diunduh.',
      icon: '⚠️'
    })
    isZipping.value = false
    return
  }

  let successCount = 0

  for (let idx = 0; idx < total; idx++) {
    const item = items[idx]
    zipProgress.value = `${idx + 1}/${total}...`
    
    try {
      const blob = await fetchMediaBlob(item, gallery.apiKey)
      if (blob && blob.size > 0) {
        let filename = item.name || `media_${item.id}.jpg`
        if (!filename.includes('.')) {
          filename += item.type === 'video' ? '.mp4' : '.jpg'
        }
        zip.file(filename, blob)
        successCount++
      }
    } catch (e) {
      console.warn('Gagal memuat berkas untuk ZIP:', item.name || item.id, e)
    }
  }

  if (successCount === 0) {
    isZipping.value = false
    zipProgress.value = ''
    gallery.showModal({
      title: 'Gagal Membuat Arsip ZIP',
      message: 'Akses unduhan langsung dibatasi oleh Google Drive (CORS). Gunakan tombol "Unduh Satu-satu" sebagai alternatif.',
      icon: '❌',
      confirmText: 'Unduh Satu-satu',
      showCancel: true,
      cancelText: 'Tutup',
      onConfirm: () => {
        executeDownloadIndividual()
      }
    })
    return
  }

  zipProgress.value = `Mengompresi ${successCount} berkas...`
  try {
    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })
    
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `arsip_dokumentasi_${Date.now()}.zip`
    document.body.appendChild(a)
    a.click()
    
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 1000)
  } catch (err) {
    console.error('Error saat kompresi ZIP:', err)
    gallery.showModal({
      title: 'Gagal Menyimpan ZIP',
      message: 'Terjadi kendala saat menghasilkan arsip zip.',
      icon: '❌'
    })
  } finally {
    isZipping.value = false
    zipProgress.value = ''
  }
}

function handleDownloadIndividual() {
  const items = gallery.selectedItems.filter(i => !i.isFolder)
  if (items.length === 0) return

  gallery.showModal({
    title: 'Konfirmasi Unduh Berkas',
    message: `Akan mengunduh ${items.length} berkas terpilih secara langsung ke perangkat Anda. Browser mungkin meminta izin untuk setiap unduhan.`,
    icon: '📥',
    confirmText: 'Mulai Unduh',
    cancelText: 'Batal',
    showCancel: true,
    onConfirm: () => {
      executeDownloadIndividual()
    }
  })
}

function executeDownloadIndividual() {
  const items = gallery.selectedItems.filter(i => !i.isFolder)
  items.forEach((item, index) => {
    setTimeout(() => {
      triggerDirectDownload(item.id, item.name)
    }, index * 800)
  })
}
</script>
