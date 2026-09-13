<template>
  <div
    ref="cardRef"
    :class="[
      'neo-card-interactive flex flex-col overflow-hidden relative group select-none',
      isSelected ? 'ring-4 ring-amber-400 bg-amber-50/40' : 'bg-white',
      item.isFolder ? 'cursor-pointer hover:border-amber-600' : 'cursor-pointer'
    ]"
    @click="handleCardClick"
  >
    
    <!-- Top Image / Folder Container -->
    <div class="relative w-full bg-zinc-100 border-b-2 border-zinc-900 overflow-hidden flex items-center justify-center min-h-[140px]">
      
      <!-- Selection Checkbox (For files only) -->
      <button
        v-if="!item.isFolder"
        @click.stop="gallery.toggleSelect(item.id)"
        class="absolute top-2.5 left-2.5 z-20 w-7 h-7 rounded-md border-2 border-zinc-900 flex items-center justify-center transition-all"
        :class="isSelected ? 'bg-amber-400 text-zinc-900 shadow-neo-sm scale-105' : 'bg-white/90 hover:bg-white text-transparent'"
        title="Tandai berkas untuk pengunduhan massal"
      >
        <span class="font-extrabold text-sm leading-none" :class="{ 'text-zinc-900': isSelected }">✓</span>
      </button>

      <!-- Type Badge (Top Right) -->
      <span
        :class="[
          'absolute top-2.5 right-2.5 z-10 px-2 py-0.5 text-[10px] font-extrabold uppercase border-2 border-zinc-900 rounded shadow-neo-sm',
          item.isFolder ? 'bg-amber-300' : (item.type === 'video' ? 'bg-cyan-300' : 'bg-white')
        ]"
      >
        {{ item.isFolder ? '📁 Direktori' : (item.type === 'video' ? '🎬 Video' : '📷 Foto') }}
      </span>

      <!-- 1. Folder Display -->
      <div
        v-if="item.isFolder"
        class="w-full py-8 flex flex-col items-center justify-center gap-2 bg-amber-100/50 p-4 transition-transform duration-300 group-hover:scale-105"
      >
        <div class="w-14 h-14 rounded-neo bg-amber-300 border-2 border-zinc-900 shadow-neo-sm flex items-center justify-center text-3xl">
          📂
        </div>
        <span class="text-xs font-bold text-zinc-800">Buka Subdirektori</span>
      </div>

      <!-- 2. Media Thumbnail -->
      <template v-else>
        <!-- GSAP Shimmer / Skeleton Loader while image loading -->
        <div
          v-if="!hasLoaded && !hasError"
          ref="skeletonRef"
          class="absolute inset-0 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] flex items-center justify-center"
        >
          <div class="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <img
          ref="imgRef"
          :src="currentImgSrc"
          :alt="item.name || item.id"
          class="w-full h-auto max-h-[520px] object-contain transition-transform duration-300 group-hover:scale-[1.02] opacity-0"
          referrerpolicy="no-referrer"
          crossorigin="anonymous"
          @error="handleImgError"
          @load="onImageLoaded"
          loading="eager"
        />

        <!-- Fallback if all image endpoints fail -->
        <div v-if="hasError && !hasLoaded" class="py-12 flex flex-col items-center justify-center gap-1 bg-zinc-100 text-zinc-400 w-full">
          <span class="text-3xl">🖼️</span>
          <span class="text-[11px] font-medium">Buka Pratinjau HD</span>
        </div>

        <!-- Quick Action Overlay on Hover -->
        <div class="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            @click.stop="gallery.openPreview(item)"
            class="px-3 py-1.5 bg-white border-2 border-zinc-900 rounded font-bold text-xs shadow-neo-sm hover:bg-amber-300 transition-colors"
          >
            🔍 Pratinjau
          </button>
          <a
            :href="item.downloadUrl"
            target="_blank"
            rel="noopener"
            @click.stop
            class="px-3 py-1.5 bg-cyan-300 border-2 border-zinc-900 rounded font-bold text-xs shadow-neo-sm hover:bg-cyan-400 transition-colors"
          >
            ⬇️ Unduh
          </a>
        </div>
      </template>

    </div>

    <!-- Card Details Footer -->
    <div class="p-3 flex flex-col justify-between gap-2 flex-1 bg-white">
      <div class="space-y-1 min-w-0">
        <h3 class="font-bold text-xs text-zinc-900 truncate" :title="item.name || item.id">
          {{ item.name || item.label || `Media ${item.id.slice(0, 8)}` }}
        </h3>
        <p v-if="item.size" class="text-[10px] font-mono text-zinc-500">
          Ukuran: {{ item.size }}
        </p>
        <p v-else-if="item.isFolder" class="text-[10px] font-bold text-amber-700">
          Subdirektori Google Drive
        </p>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-between gap-1 pt-2 border-t border-zinc-100">
        <template v-if="item.isFolder">
          <button
            @click.stop="gallery.enterSubfolder(item)"
            class="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 py-0.5"
          >
            <span>👉</span> Masuk Direktori
          </button>
          <a
            :href="item.rawUrl"
            target="_blank"
            rel="noopener"
            @click.stop
            class="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800"
          >
            Akses Google Drive ↗
          </a>
        </template>
        <template v-else>
          <button
            @click.stop="handleAddToCompare"
            class="text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1 py-0.5"
            title="Sematkan pada panel komparasi berdampingan"
          >
            <span>⊟</span> Komparasi
          </button>
          <button
            @click.stop="gallery.removeItem(item.id)"
            class="text-[11px] font-semibold text-rose-500 hover:text-rose-700 py-0.5"
            title="Hapus dari daftar sesi"
          >
            Hapus
          </button>
        </template>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGalleryStore } from '@/stores/gallery'
import gsap from 'gsap'

const props = defineProps({
  item: { type: Object, required: true }
})

const gallery = useGalleryStore()
const hasError = ref(false)
const hasLoaded = ref(false)
const fallbackStep = ref(0)
const imgRef = ref(null)
const cardRef = ref(null)
const skeletonRef = ref(null)

const currentImgSrc = computed(() => {
  if (fallbackStep.value === 0 && props.item.apiThumbnail) {
    return props.item.apiThumbnail.replace(/=s\d+/, '=w800')
  } else if (fallbackStep.value <= 1) {
    return `https://drive.google.com/thumbnail?id=${props.item.id}&sz=w800`
  } else if (fallbackStep.value === 2) {
    return `https://lh3.googleusercontent.com/d/${props.item.id}=w800`
  } else if (fallbackStep.value === 3) {
    return `https://drive.google.com/uc?export=view&id=${props.item.id}`
  }
  return ''
})

function handleImgError() {
  if (fallbackStep.value < 3) {
    fallbackStep.value++
  } else {
    hasError.value = true
  }
}

function onImageLoaded() {
  hasLoaded.value = true
  if (imgRef.value) {
    gsap.to(imgRef.value, {
      opacity: 1,
      duration: 0.35,
      ease: 'power2.out',
    })
  }
}

onMounted(() => {
  if (cardRef.value) {
    gsap.from(cardRef.value, {
      scale: 0.96,
      opacity: 0.8,
      duration: 0.25,
      ease: 'back.out(1.4)'
    })
  }
  if (skeletonRef.value) {
    gsap.to(skeletonRef.value, {
      backgroundPosition: '200% 0',
      repeat: -1,
      duration: 1.2,
      ease: 'linear'
    })
  }
})

const isSelected = computed(() => gallery.selectedIds.includes(props.item.id))

function handleCardClick() {
  if (props.item.isFolder) {
    gallery.enterSubfolder(props.item)
  } else {
    gallery.openPreview(props.item)
  }
}

function handleAddToCompare() {
  if (!gallery.compareA) {
    gallery.setCompareA(props.item)
  } else {
    gallery.setCompareB(props.item)
  }
  gallery.viewMode = 'splitscreen'
}
</script>
