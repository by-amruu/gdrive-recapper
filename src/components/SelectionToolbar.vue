<template>
  <transition name="slide-up">
    <div
      v-if="gallery.selectedCount > 0"
      class="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-xl w-full"
    >
      <div class="neo-card bg-zinc-900 text-white p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-neo-lg border-2 border-zinc-900">
        
        <!-- Left: Selected Count & Deselect -->
        <div class="flex items-center gap-2.5">
          <span class="w-6 h-6 rounded-full bg-amber-400 text-zinc-900 font-extrabold text-xs flex items-center justify-center">
            {{ gallery.selectedCount }}
          </span>
          <span class="text-xs font-bold tracking-tight">Berkas Terpilih</span>
          <button
            @click="gallery.deselectAll"
            class="text-[11px] text-zinc-400 hover:text-white underline ml-1"
          >
            Batal
          </button>
        </div>

        <!-- Right: Download Action Buttons -->
        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
          
          <!-- Download ZIP Button -->
          <button
            @click="handleDownloadZip"
            :disabled="isZipping"
            class="btn-neo bg-amber-400 hover:bg-amber-300 text-zinc-900 text-xs px-3.5 py-2 flex items-center gap-1.5 flex-1 sm:flex-initial"
          >
            <span v-if="isZipping" class="animate-spin text-xs">⏳</span>
            <span v-else>📦</span>
            <span>{{ isZipping ? zipProgress : 'Unduh Arsip (.ZIP)' }}</span>
          </button>

          <!-- Download Files Individually -->
          <button
            @click="handleDownloadIndividual"
            class="btn-neo bg-cyan-300 hover:bg-cyan-400 text-zinc-900 text-xs px-3 py-2 flex items-center gap-1 flex-1 sm:flex-initial"
            title="Unduh berkas terpilih secara langsung"
          >
            <span>⬇️</span>
            <span>Unduh Parsial</span>
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

const gallery = useGalleryStore()
const isZipping = ref(false)
const zipProgress = ref('')

async function handleDownloadZip() {
  if (gallery.selectedItems.length === 0) return
  isZipping.value = true
  zipProgress.value = 'Mempersiapkan...'

  const zip = new JSZip()
  const total = gallery.selectedItems.length
  let completed = 0

  for (const item of gallery.selectedItems) {
    try {
      zipProgress.value = `Mengunduh (${completed + 1}/${total})...`
      const downloadUrl = `https://drive.google.com/thumbnail?id=${item.id}&sz=w2500`
      const res = await fetch(downloadUrl)
      if (res.ok) {
        const blob = await res.blob()
        const filename = item.name || `media_${item.id}.jpg`
        zip.file(filename, blob)
      }
    } catch (e) {
      console.warn('Gagal unduh berkas untuk arsip zip:', item.id, e)
    }
    completed++
  }

  zipProgress.value = 'Mengompresi berkas ZIP...'
  const content = await zip.generateAsync({ type: 'blob' })
  
  const a = document.createElement('a')
  a.href = URL.createObjectURL(content)
  a.download = `arsip_dokumentasi_${Date.now()}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  isZipping.value = false
  zipProgress.value = ''
}

function handleDownloadIndividual() {
  gallery.selectedItems.forEach((item, index) => {
    setTimeout(() => {
      const a = document.createElement('a')
      a.href = item.downloadUrl
      a.target = '_blank'
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }, index * 400)
  })
}
</script>
