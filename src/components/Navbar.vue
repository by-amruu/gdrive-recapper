<template>
  <header class="bg-white border-b-2 border-zinc-900 sticky top-0 z-30">
    <div class="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
      
      <!-- Brand Logo & Identity -->
      <div class="flex items-center gap-2.5 select-none flex-shrink-0">
        <div class="w-9 h-9 rounded-neo bg-amber-300 border-2 border-zinc-900 shadow-neo-sm flex items-center justify-center font-bold text-lg">
          📸
        </div>
        <div class="hidden sm:block">
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-base tracking-tight text-zinc-900">GDrive Media Recapper</span>
            <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-cyan-200 border border-zinc-900 rounded font-bold">PRO</span>
          </div>
          <p class="text-xs text-zinc-500 font-medium">Platform Kurasi &amp; Dokumentasi Visual</p>
        </div>
        <span class="sm:hidden font-extrabold text-sm text-zinc-900">GDrive Recapper</span>
      </div>

      <!-- Right Controls -->
      <div class="flex items-center gap-1.5 sm:gap-2">

        <!-- Share Link Button (only when there are tabs & not in viewer mode) -->
        <button
          v-if="gallery.tabs.length > 0 && !gallery.isViewerMode"
          @click="openShareLinkModal"
          class="btn-neo bg-amber-300 hover:bg-amber-400 text-zinc-900 text-xs px-3 py-1.5 flex items-center gap-1.5"
          title="Buat & bagikan tautan akses folder"
        >
          <span>🔗</span>
          <span class="hidden sm:inline">Bagikan</span>
        </button>

        <!-- Settings -->
        <button
          v-if="!gallery.isViewerMode"
          @click="gallery.isSettingsOpen = true"
          class="btn-neo bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs px-2.5 sm:px-3 py-1.5"
          title="Konfigurasi API Key Google Drive"
        >
          <span>⚙️</span>
          <span class="hidden md:inline ml-1">Pengaturan</span>
        </button>

        <!-- Hapus Cache -->
        <button
          v-if="!gallery.isViewerMode"
          @click="confirmClearCache"
          class="btn-neo bg-zinc-100 hover:bg-rose-100 text-zinc-700 hover:text-rose-700 text-xs px-2.5 sm:px-3 py-1.5"
          title="Bersihkan seluruh cache aplikasi dan muat ulang"
        >
          <span>⚡</span>
          <span class="hidden md:inline ml-1">Cache</span>
        </button>

        <!-- Reset Sesi -->
        <button
          v-if="gallery.totalCount > 0 && !gallery.isViewerMode"
          @click="confirmResetGallery"
          class="btn-neo bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs px-2.5 sm:px-3 py-1.5"
          title="Kosongkan seluruh tab media saat ini"
        >
          <span>🗑️</span>
          <span class="hidden md:inline ml-1">Kosongkan</span>
        </button>

      </div>

    </div>
  </header>
</template>

<script setup>
import { inject, getCurrentInstance } from 'vue'
import { useGalleryStore } from '@/stores/gallery'

const gallery = useGalleryStore()

function openShareLinkModal() {
  const tab = gallery.currentTab
  if (!tab) return
  // Call the exposed method from App.vue
  if (gallery.$onShareOpen) {
    gallery.$onShareOpen(tab.id, tab.name)
  }
}

function confirmClearCache() {
  gallery.showModal({
    title: 'Konfirmasi Bersihkan Cache',
    message: 'Tindakan ini akan menghapus seluruh data sesi lokal dan me-reload aplikasi dalam keadaan bersih optimal.',
    icon: '🧹',
    confirmText: 'Bersihkan Sekarang',
    isDanger: true,
    showCancel: true,
    onConfirm: () => {
      gallery.clearAbsoluteCache()
    }
  })
}

function confirmResetGallery() {
  gallery.showModal({
    title: 'Konfirmasi Kosongkan Sesi',
    message: 'Seluruh tab folder dan berkas media yang sedang dimuat akan dibersihkan dari tampilan saat ini.',
    icon: '🗑️',
    confirmText: 'Ya, Kosongkan',
    isDanger: true,
    showCancel: true,
    onConfirm: () => {
      gallery.clearAll()
    }
  })
}
</script>
