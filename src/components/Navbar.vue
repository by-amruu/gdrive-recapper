<template>
  <header class="bg-white border-b-2 border-zinc-900 sticky top-0 z-30">
    <div class="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">

      <!-- Brand -->
      <div class="flex items-center gap-2.5 select-none flex-shrink-0">
        <div class="w-9 h-9 rounded-neo bg-amber-300 border-2 border-zinc-900 shadow-neo-sm flex items-center justify-center text-lg">
          📸
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="font-extrabold text-sm sm:text-base tracking-tight text-zinc-900">GDrive Recapper</span>
            <span class="hidden sm:inline text-[10px] uppercase font-mono px-1.5 py-0.5 bg-cyan-200 border border-zinc-900 rounded font-bold">PRO</span>
          </div>
          <p class="hidden sm:block text-xs text-zinc-500 font-medium">Platform Kurasi &amp; Dokumentasi Visual</p>
        </div>
      </div>

      <!-- Right Controls -->
      <div class="flex items-center gap-1.5">

        <!-- Share Button (owner mode only, folder must be loaded) -->
        <button
          v-if="gallery.currentTab && !gallery.isViewerMode"
          @click="emitShare"
          class="btn-neo bg-amber-300 hover:bg-amber-400 text-zinc-900 text-xs px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5"
          title="Buat tautan berbagi untuk folder ini"
        >
          <span>🔗</span>
          <span class="hidden sm:inline">Bagikan</span>
        </button>

        <!-- Single Action: Bersihkan Cache & Kosongkan Sesi -->
        <button
          v-if="!gallery.isViewerMode"
          @click="confirmClearAll"
          class="btn-neo bg-zinc-100 hover:bg-rose-100 text-zinc-700 hover:text-rose-800 text-xs px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5"
          title="Hapus seluruh cache peramban dan kosongkan sesi"
        >
          <span>⚡</span>
          <span class="hidden sm:inline">Bersihkan &amp; Kosongkan</span>
        </button>

      </div>
    </div>
  </header>
</template>

<script setup>
import { useGalleryStore } from '@/stores/gallery'

const emit = defineEmits(['open-share'])
const gallery = useGalleryStore()

function emitShare() {
  const tab = gallery.currentTab
  if (!tab) return
  emit('open-share', { folderId: tab.id, folderName: tab.name })
}

function confirmClearAll() {
  gallery.showModal({
    title: 'Hapus Cache & Kosongkan Sesi',
    message: 'Tindakan ini akan mengosongkan seluruh tab galeri dan menghapus seluruh cache data di peramban, lalu me-reload aplikasi.',
    icon: '⚡',
    confirmText: 'Ya, Bersihkan & Kosongkan',
    isDanger: true,
    showCancel: true,
    onConfirm: () => {
      gallery.clearAll()
      gallery.clearAbsoluteCache()
    }
  })
}
</script>
