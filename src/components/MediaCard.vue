<template>
  <div
    ref="cardRef"
    :class="[
      'neo-card-interactive flex flex-col overflow-hidden relative group select-none',
      isSelected ? 'ring-4 ring-amber-400 bg-amber-50/40' : 'bg-white',
      item.isFolder ? 'cursor-pointer' : 'cursor-pointer'
    ]"
    @click="handleCardClick"
  >
    
    <!-- Image / Folder Area -->
    <div class="relative w-full bg-zinc-100 border-b-2 border-zinc-900 overflow-hidden flex items-center justify-center min-h-[140px]">

      <!-- Checkbox (files only) — big for mobile -->
      <button
        v-if="!item.isFolder"
        @click.stop="gallery.toggleSelect(item.id)"
        :class="[
          'absolute top-2 left-2 z-20 flex items-center justify-center rounded-lg border-2 border-zinc-900 transition-all touch-manipulation',
          'w-8 h-8',
          isSelected ? 'bg-amber-400 shadow-neo-sm scale-110' : 'bg-white/90 hover:bg-white'
        ]"
        aria-label="Pilih berkas"
      >
        <span class="font-extrabold text-base leading-none text-zinc-900" v-if="isSelected">✓</span>
        <span class="w-3 h-3 rounded border border-zinc-400 block" v-else></span>
      </button>

      <!-- Type Badge -->
      <span
        :class="[
          'absolute top-2 right-2 z-10 px-2 py-0.5 text-[10px] font-extrabold uppercase border-2 border-zinc-900 rounded shadow-neo-sm',
          item.isFolder ? 'bg-amber-300' : (item.type === 'video' ? 'bg-cyan-300' : 'bg-white')
        ]"
      >
        {{ item.isFolder ? '📁 Folder' : (item.type === 'video' ? '🎬 Video' : '📷 Foto') }}
      </span>

      <!-- Folder thumbnail -->
      <div
        v-if="item.isFolder"
        class="w-full py-8 flex flex-col items-center justify-center gap-2 bg-amber-100/50 p-4 transition-transform duration-300 group-hover:scale-105"
      >
        <div class="w-14 h-14 rounded-neo bg-amber-300 border-2 border-zinc-900 shadow-neo-sm flex items-center justify-center text-3xl">📂</div>
        <span class="text-xs font-bold text-zinc-800">Buka Subfolder</span>
      </div>

      <!-- Media thumbnail -->
      <template v-else>
        <div v-if="!hasLoaded && !hasError" ref="skeletonRef"
          class="absolute inset-0 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] flex items-center justify-center">
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

        <div v-if="hasError && !hasLoaded" class="py-12 flex flex-col items-center justify-center gap-1 bg-zinc-100 text-zinc-400 w-full">
          <span class="text-3xl">🖼️</span>
          <span class="text-[11px] font-medium">Pratinjau tidak tersedia</span>
        </div>

        <!-- Desktop hover overlay -->
        <div class="hidden sm:flex absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
          <button
            @click.stop="gallery.openPreview(item)"
            class="px-3 py-1.5 bg-white border-2 border-zinc-900 rounded font-bold text-xs shadow-neo-sm hover:bg-amber-300 transition-colors"
          >🔍 Pratinjau</button>
          <button
            @click.stop="handleDirectDownload"
            class="px-3 py-1.5 bg-cyan-300 border-2 border-zinc-900 rounded font-bold text-xs shadow-neo-sm hover:bg-cyan-400 transition-colors"
          >⬇️ Unduh</button>
        </div>

        <!-- Mobile: persistent bottom bar -->
        <div class="sm:hidden absolute bottom-0 inset-x-0 flex items-center justify-between px-2 py-1.5 bg-zinc-900/80 backdrop-blur-sm">
          <button @click.stop="gallery.openPreview(item)"
            class="text-white text-xs font-bold px-2.5 py-1 rounded bg-white/20 active:bg-white/40 touch-manipulation">
            🔍
          </button>
          <button @click.stop="gallery.toggleSelect(item.id)"
            :class="['text-xs font-extrabold px-3 py-1 rounded border border-white/30 transition-colors touch-manipulation',
              isSelected ? 'bg-amber-400 text-zinc-900 border-amber-400' : 'bg-white/10 text-white']">
            {{ isSelected ? '✓ Dipilih' : '+ Pilih' }}
          </button>
          <button @click.stop="handleDirectDownload"
            class="text-white text-xs font-bold px-2.5 py-1 rounded bg-cyan-600/80 active:bg-cyan-500 touch-manipulation">
            ⬇️
          </button>
        </div>
      </template>

    </div>

    <!-- Card Footer -->
    <div class="p-2.5 sm:p-3 flex flex-col justify-between gap-1.5 flex-1 bg-white">
      <h3 class="font-bold text-xs text-zinc-900 truncate leading-snug" :title="item.name || item.id">
        {{ item.name || item.label || `Media ${item.id.slice(0, 8)}` }}
      </h3>
      <p v-if="item.size" class="text-[10px] font-mono text-zinc-400">{{ item.size }}</p>
      <p v-else-if="item.isFolder" class="text-[10px] font-bold text-amber-700">Subdirektori</p>

      <!-- Footer actions -->
      <div class="flex items-center justify-between gap-1 pt-1.5 border-t border-zinc-100">
        <template v-if="item.isFolder">
          <button @click.stop="gallery.enterSubfolder(item)"
            class="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 touch-manipulation">
            👉 Masuk
          </button>
          <a :href="item.rawUrl" target="_blank" rel="noopener" @click.stop
            class="text-[11px] font-semibold text-zinc-400 hover:text-zinc-700">
            Drive ↗
          </a>
        </template>
        <template v-else>
          <button @click.stop="gallery.toggleSelect(item.id)"
            :class="['text-[11px] font-bold flex items-center gap-1 px-2 py-0.5 rounded transition-colors touch-manipulation',
              isSelected ? 'bg-amber-300 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100']">
            <span>{{ isSelected ? '✓' : '☐' }}</span>
            {{ isSelected ? 'Dipilih' : 'Pilih' }}
          </button>
          <button @click.stop="handleDirectDownload"
            class="text-[11px] font-semibold text-cyan-700 hover:text-cyan-900 touch-manipulation">
            ⬇️ Unduh
          </button>
        </template>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGalleryStore } from '@/stores/gallery'
import { triggerDirectDownload } from '@/utils/downloader'
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
  if (fallbackStep.value < 3) fallbackStep.value++
  else hasError.value = true
}

function onImageLoaded() {
  hasLoaded.value = true
  if (imgRef.value) gsap.to(imgRef.value, { opacity: 1, duration: 0.35, ease: 'power2.out' })
}

const isSelected = computed(() => gallery.selectedIds.includes(props.item.id))

function handleCardClick() {
  if (props.item.isFolder) {
    gallery.enterSubfolder(props.item)
    return
  }
  // Touch device: tap = toggle select
  // Mouse device: click = open preview
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  if (isTouch) {
    gallery.toggleSelect(props.item.id)
  } else {
    gallery.openPreview(props.item)
  }
}

function handleDirectDownload() {
  const filename = props.item.name || `media_${props.item.id}`
  gallery.showModal({
    title: 'Konfirmasi Unduh Berkas',
    message: `Unduh "${filename}" langsung ke perangkat Anda?`,
    icon: '📥',
    confirmText: 'Unduh Sekarang',
    cancelText: 'Batal',
    showCancel: true,
    onConfirm: () => triggerDirectDownload(props.item.id, filename)
  })
}

onMounted(() => {
  if (cardRef.value) {
    gsap.from(cardRef.value, { scale: 0.96, opacity: 0.8, duration: 0.25, ease: 'back.out(1.4)' })
  }
  if (skeletonRef.value) {
    gsap.to(skeletonRef.value, { backgroundPosition: '200% 0', repeat: -1, duration: 1.2, ease: 'linear' })
  }

  // Long press to select on mobile
  if (props.item.isFolder || !cardRef.value) return
  let timer = null
  cardRef.value.addEventListener('pointerdown', () => {
    timer = setTimeout(() => {
      gallery.toggleSelect(props.item.id)
      if (navigator.vibrate) navigator.vibrate(30)
    }, 500)
  }, { passive: true })
  cardRef.value.addEventListener('pointerup', () => clearTimeout(timer), { passive: true })
  cardRef.value.addEventListener('pointermove', () => clearTimeout(timer), { passive: true })
  cardRef.value.addEventListener('pointerleave', () => clearTimeout(timer), { passive: true })
})
</script>
