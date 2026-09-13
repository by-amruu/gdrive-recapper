<template>
  <header class="bg-white border-b-2 border-zinc-900 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-3 select-none">
        <div class="w-10 h-10 rounded-neo bg-amber-300 border-2 border-zinc-900 shadow-neo-sm flex items-center justify-center font-bold text-lg">
          📸
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-base tracking-tight text-zinc-900">GDrive Recapper</span>
            <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-cyan-200 border border-zinc-900 rounded font-bold">v2.1</span>
          </div>
          <p class="text-xs text-zinc-500 font-medium">Dokumentasi Acara Kampus</p>
        </div>
      </div>

      <!-- Center: Mode Switcher -->
      <div class="hidden sm:flex items-center gap-1 bg-zinc-100 p-1 border-2 border-zinc-900 rounded-neo shadow-neo-sm">
        <button
          @click="gallery.viewMode = 'grid'"
          :class="[
            'px-3.5 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5',
            gallery.viewMode === 'grid'
              ? 'bg-amber-300 text-zinc-900 border border-zinc-900 shadow-neo-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          ]"
        >
          <span>🗂️</span> Galeri
        </button>
        <button
          @click="gallery.viewMode = 'splitscreen'"
          :class="[
            'px-3.5 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5',
            gallery.viewMode === 'splitscreen'
              ? 'bg-amber-300 text-zinc-900 border border-zinc-900 shadow-neo-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          ]"
        >
          <span>⊟</span> Split Screen
        </button>
      </div>

      <!-- Right Controls -->
      <div class="flex items-center gap-2">
        <!-- Hapus Cache Mutlak -->
        <button
          @click="confirmClearCache"
          class="btn-neo bg-zinc-100 hover:bg-rose-100 text-zinc-700 hover:text-rose-700 text-xs px-3 py-1.5"
          title="Hapus seluruh cache local & reload mutlak"
        >
          <span>⚡</span>
          <span class="hidden sm:inline">Hapus Cache Mutlak</span>
        </button>

        <!-- Reset Galeri -->
        <button
          v-if="gallery.totalCount > 0"
          @click="confirmResetGallery"
          class="btn-neo bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs px-3 py-1.5"
          title="Kosongkan galeri saat ini"
        >
          <span>🗑️</span>
          <span class="hidden md:inline">Reset Galeri</span>
        </button>
      </div>

    </div>
  </header>
</template>

<script setup>
import { useGalleryStore } from '@/stores/gallery'

const gallery = useGalleryStore()

function confirmClearCache() {
  gallery.showModal({
    title: 'Hapus Cache Mutlak?',
    message: 'Tindakan ini akan membersihkan seluruh localStorage, cache data, dan me-reload aplikasi secara bersih dari awal.',
    icon: '🧹',
    confirmText: 'Bersihkan & Reload',
    isDanger: true,
    showCancel: true,
    onConfirm: () => {
      gallery.clearAbsoluteCache()
    }
  })
}

function confirmResetGallery() {
  gallery.showModal({
    title: 'Kosongkan Galeri?',
    message: 'Semua item foto dan video yang saat ini dimuat akan dibersihkan dari tampilan.',
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
