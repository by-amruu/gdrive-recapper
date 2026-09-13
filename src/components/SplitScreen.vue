<template>
  <div class="space-y-4">
    
    <!-- Top toolbar -->
    <div class="flex items-center justify-between bg-white p-3 border-2 border-zinc-900 rounded-neo shadow-neo-sm">
      <div class="flex items-center gap-2">
        <span class="text-base font-bold">⊟</span>
        <h2 class="font-extrabold text-xs text-zinc-900">Perbandingan Media Berdampingan</h2>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="gallery.swapCompare"
          :disabled="!gallery.compareA || !gallery.compareB"
          class="px-2.5 py-1 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 border border-zinc-900 rounded disabled:opacity-40"
        >
          🔄 Tukar Posisi
        </button>
        <button
          @click="gallery.clearCompare"
          class="px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-zinc-900 rounded"
        >
          Bersihkan
        </button>
        <button
          @click="gallery.viewMode = 'grid'"
          class="btn-neo-white text-xs px-3 py-1"
        >
          Kembali ke Galeri
        </button>
      </div>
    </div>

    <!-- Dual panels -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4" style="min-height: 520px">
      
      <!-- Panel A -->
      <div class="neo-card p-3 flex flex-col bg-white">
        <div class="flex items-center justify-between border-b-2 border-zinc-900 pb-2 mb-2">
          <span class="px-2 py-0.5 text-[11px] font-bold bg-amber-300 border border-zinc-900 rounded">
            Panel A
          </span>
          <span class="text-xs font-bold text-zinc-700 truncate max-w-[200px]">
            {{ gallery.compareA?.name || 'Belum dipilih' }}
          </span>
          <button
            v-if="gallery.compareA"
            @click="gallery.setCompareA(null)"
            class="text-xs text-rose-500 font-bold"
          >
            Lepas
          </button>
        </div>

        <div class="flex-1 relative bg-zinc-100 border border-zinc-900 rounded overflow-hidden flex items-center justify-center">
          <img
            v-if="gallery.compareA && gallery.compareA.type !== 'video'"
            :src="gallery.compareA.highResUrl || gallery.compareA.thumbUrl"
            class="max-w-full max-h-full object-contain"
          />
          <iframe
            v-else-if="gallery.compareA && gallery.compareA.type === 'video'"
            :src="gallery.compareA.iframePreviewUrl"
            class="w-full h-full border-0"
          />
          <div v-else class="text-center p-6 text-zinc-400 space-y-2">
            <p class="text-3xl">📷</p>
            <p class="text-xs font-bold">Pilih foto dari galeri untuk dimasukkan ke Panel A</p>
          </div>
        </div>
      </div>

      <!-- Panel B -->
      <div class="neo-card p-3 flex flex-col bg-white">
        <div class="flex items-center justify-between border-b-2 border-zinc-900 pb-2 mb-2">
          <span class="px-2 py-0.5 text-[11px] font-bold bg-cyan-300 border border-zinc-900 rounded">
            Panel B
          </span>
          <span class="text-xs font-bold text-zinc-700 truncate max-w-[200px]">
            {{ gallery.compareB?.name || 'Belum dipilih' }}
          </span>
          <button
            v-if="gallery.compareB"
            @click="gallery.setCompareB(null)"
            class="text-xs text-rose-500 font-bold"
          >
            Lepas
          </button>
        </div>

        <div class="flex-1 relative bg-zinc-100 border border-zinc-900 rounded overflow-hidden flex items-center justify-center">
          <img
            v-if="gallery.compareB && gallery.compareB.type !== 'video'"
            :src="gallery.compareB.highResUrl || gallery.compareB.thumbUrl"
            class="max-w-full max-h-full object-contain"
          />
          <iframe
            v-else-if="gallery.compareB && gallery.compareB.type === 'video'"
            :src="gallery.compareB.iframePreviewUrl"
            class="w-full h-full border-0"
          />
          <div v-else class="text-center p-6 text-zinc-400 space-y-2">
            <p class="text-3xl">🎬</p>
            <p class="text-xs font-bold">Pilih foto dari galeri untuk dimasukkan ke Panel B</p>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { useGalleryStore } from '@/stores/gallery'

const gallery = useGalleryStore()
</script>
