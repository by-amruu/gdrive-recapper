<template>
  <!-- Only show in viewer mode: a readonly top banner -->
  <div
    v-if="gallery.shareMode === 'viewer'"
    class="bg-amber-300 border-b-2 border-zinc-900 px-4 py-2 flex items-center justify-between gap-3"
  >
    <div class="flex items-center gap-2 min-w-0">
      <span class="text-base">👁️</span>
      <div class="min-w-0">
        <p class="font-extrabold text-xs text-zinc-900">Mode Pelihat — <span class="font-bold">{{ gallery.shareTabName }}</span></p>
        <p class="text-[11px] text-zinc-700 font-medium hidden sm:block">Anda mengakses melalui tautan berbagi. Pilih berkas & unduh sesuai kebutuhan.</p>
      </div>
    </div>
    <div class="flex items-center gap-2 flex-shrink-0">
      <span class="text-[10px] font-mono px-2 py-0.5 bg-white border border-zinc-900 rounded font-bold text-zinc-700 uppercase">VIEWER</span>
    </div>
  </div>

  <div
    v-else-if="gallery.shareMode === 'editor'"
    class="bg-cyan-200 border-b-2 border-zinc-900 px-4 py-2 flex items-center justify-between gap-3"
  >
    <div class="flex items-center gap-2 min-w-0">
      <span class="text-base">✏️</span>
      <div class="min-w-0">
        <p class="font-extrabold text-xs text-zinc-900">Mode Editor — <span class="font-bold">{{ gallery.shareTabName }}</span></p>
        <p class="text-[11px] text-zinc-700 font-medium hidden sm:block">Anda memiliki akses penuh ke galeri ini melalui tautan editor.</p>
      </div>
    </div>
    <div class="flex items-center gap-2 flex-shrink-0">
      <span class="text-[10px] font-mono px-2 py-0.5 bg-white border border-zinc-900 rounded font-bold text-zinc-700 uppercase">EDITOR</span>
    </div>
  </div>
</template>

<script setup>
import { useGalleryStore } from '@/stores/gallery'
const gallery = useGalleryStore()
</script>
