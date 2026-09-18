<template>
  <!-- Viewer mode banner -->
  <div
    v-if="gallery.shareMode === 'viewer'"
    class="bg-amber-300 border-b-2 border-zinc-900 px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2"
  >
    <div class="flex items-center gap-2 min-w-0">
      <span class="text-base flex-shrink-0">👁️</span>
      <div class="min-w-0">
        <p class="font-extrabold text-xs text-zinc-900 truncate">Mode Pelihat — <span>{{ gallery.shareTabName }}</span></p>
        <p class="text-[11px] text-zinc-700 hidden sm:block">Anda mengakses via tautan berbagi. Pilih & unduh berkas sesuai kebutuhan.</p>
      </div>
    </div>
    <span class="text-[10px] font-mono px-2 py-0.5 bg-white border border-zinc-900 rounded font-bold text-zinc-700 uppercase flex-shrink-0">VIEWER</span>
  </div>

  <!-- Editor mode banner -->
  <div
    v-else-if="gallery.shareMode === 'editor'"
    class="bg-cyan-200 border-b-2 border-zinc-900 px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2"
  >
    <div class="flex items-center gap-2 min-w-0">
      <span class="text-base flex-shrink-0">✏️</span>
      <div class="min-w-0">
        <p class="font-extrabold text-xs text-zinc-900 truncate">Mode Editor — <span>{{ gallery.shareTabName }}</span></p>
        <p class="text-[11px] text-zinc-700 hidden sm:block">Akses penuh via tautan editor.</p>
      </div>
    </div>
    <span class="text-[10px] font-mono px-2 py-0.5 bg-white border border-zinc-900 rounded font-bold text-zinc-700 uppercase flex-shrink-0">EDITOR</span>
  </div>
</template>

<script setup>
import { useGalleryStore } from '@/stores/gallery'
const gallery = useGalleryStore()
</script>
