<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="gallery.activeItem"
        class="modal-overlay"
        @click.self="gallery.closePreview"
      >
        <div class="relative flex flex-col w-full h-full max-w-6xl mx-auto p-4 max-h-screen">
          
          <!-- Modal Top Bar -->
          <div class="bg-white border-2 border-zinc-900 rounded-neo p-3 mb-3 flex items-center justify-between gap-3 shadow-neo-sm">
            
            <!-- Media Info -->
            <div class="flex items-center gap-2 min-w-0">
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase border border-zinc-900 rounded bg-amber-300">
                {{ item.type === 'video' ? '🎬 Video' : '📷 Foto' }}
              </span>
              <p class="font-bold text-xs text-zinc-900 truncate" :title="item.name || item.id">
                {{ item.name || item.label || item.id }}
              </p>
              <span class="text-xs text-zinc-400 hidden sm:inline">
                ({{ gallery.activeIndex + 1 }} / {{ gallery.filteredItems.length }})
              </span>
            </div>

            <!-- Top Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Select toggle -->
              <button
                @click="gallery.toggleSelect(item.id)"
                :class="[
                  'px-3 py-1.5 rounded font-bold text-xs border border-zinc-900 transition-all flex items-center gap-1.5',
                  isSelected ? 'bg-amber-400 text-zinc-900 shadow-neo-sm' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                ]"
              >
                <span>{{ isSelected ? '✓ Terpilih' : '+ Pilih' }}</span>
              </button>

              <!-- Download Button -->
              <a
                :href="item.downloadUrl"
                target="_blank"
                rel="noopener"
                class="btn-neo-cyan text-xs px-3.5 py-1.5"
                title="Download file ini langsung"
              >
                <span>⬇️</span>
                <span class="hidden sm:inline">Download</span>
              </a>

              <!-- Close Button -->
              <button
                @click="gallery.closePreview"
                class="w-8 h-8 flex items-center justify-center font-bold text-sm bg-zinc-100 hover:bg-zinc-200 border border-zinc-900 rounded"
                title="Tutup (ESC)"
              >
                ✕
              </button>
            </div>

          </div>

          <!-- Main Preview Area -->
          <div class="flex-1 relative flex items-center justify-center min-h-0 bg-zinc-900 border-2 border-zinc-900 rounded-neo overflow-hidden shadow-neo-md">
            
            <!-- Prev Navigation Button -->
            <button
              @click="gallery.prevItem"
              :disabled="gallery.activeIndex <= 0"
              class="absolute left-3 z-20 w-10 h-10 rounded-neo bg-white border-2 border-zinc-900 shadow-neo flex items-center justify-center font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-300 transition-colors"
              title="Sebelumnya (Panah Kiri)"
            >
              ←
            </button>

            <!-- Native Image Preview -->
            <div class="w-full h-full flex items-center justify-center p-2 relative">
              <div v-if="imgLoading" class="absolute inset-0 flex items-center justify-center text-white text-xs font-bold gap-2">
                <span class="animate-spin text-lg">⏳</span> Memuat Preview HD...
              </div>

              <!-- High-Res Image with referrerpolicy and error fallback to iframe if needed -->
              <img
                v-if="item.type !== 'video' && !useIframeFallback"
                :key="item.id + '-' + previewSrc"
                :src="previewSrc"
                :alt="item.name"
                referrerpolicy="no-referrer"
                class="max-w-full max-h-full object-contain rounded select-none"
                @load="imgLoading = false"
                @error="handleImgPreviewError"
              />

              <!-- Iframe Preview (for video or when direct image load is restricted) -->
              <iframe
                v-else
                :key="item.id + '-frame'"
                :src="item.iframePreviewUrl"
                class="w-full h-full border-0"
                allow="autoplay"
                @load="imgLoading = false"
              />
            </div>

            <!-- Next Navigation Button -->
            <button
              @click="gallery.nextItem"
              :disabled="gallery.activeIndex >= gallery.filteredItems.length - 1"
              class="absolute right-3 z-20 w-10 h-10 rounded-neo bg-white border-2 border-zinc-900 shadow-neo flex items-center justify-center font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-300 transition-colors"
              title="Berikutnya (Panah Kanan)"
            >
              →
            </button>

          </div>

          <!-- Bottom Shortcut Tip -->
          <div class="text-center text-[11px] font-semibold text-zinc-500 pt-2">
            Gunakan tombol <kbd class="px-1 py-0.5 bg-zinc-200 border border-zinc-400 rounded text-[10px]">←</kbd> <kbd class="px-1 py-0.5 bg-zinc-200 border border-zinc-400 rounded text-[10px]">→</kbd> untuk geser foto, dan <kbd class="px-1 py-0.5 bg-zinc-200 border border-zinc-400 rounded text-[10px]">ESC</kbd> untuk menutup.
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useGalleryStore } from '@/stores/gallery'

const gallery = useGalleryStore()
const imgLoading = ref(true)
const useIframeFallback = ref(false)
const previewStep = ref(0)

const item = computed(() => gallery.activeItem)
const isSelected = computed(() => item.value ? gallery.selectedIds.includes(item.value.id) : false)

const previewSrc = computed(() => {
  if (!item.value) return ''
  if (previewStep.value === 0 && item.value.apiThumbnail) {
    return item.value.apiThumbnail.replace(/=s\d+/, '=w2048')
  } else if (previewStep.value <= 1) {
    return `https://drive.google.com/thumbnail?id=${item.value.id}&sz=w2000`
  } else if (previewStep.value === 2) {
    return `https://lh3.googleusercontent.com/d/${item.value.id}=w2000`
  }
  return item.value.thumbUrl
})

function handleImgPreviewError() {
  if (previewStep.value < 2) {
    previewStep.value++
  } else {
    // If all direct image URLs are blocked by browser/drive CORS, fallback to clean /preview iframe
    useIframeFallback.value = true
  }
}

watch(item, () => {
  imgLoading.value = true
  useIframeFallback.value = false
  previewStep.value = 0
})

function handleKey(e) {
  if (!gallery.activeItem) return
  if (e.key === 'Escape') gallery.closePreview()
  if (e.key === 'ArrowLeft') gallery.prevItem()
  if (e.key === 'ArrowRight') gallery.nextItem()
  if (e.key === ' ' || e.key === 'Enter') {
    if (gallery.activeItem) gallery.toggleSelect(gallery.activeItem.id)
  }
}

onMounted(() => window.addEventListener('keydown', handleKey))
onUnmounted(() => window.removeEventListener('keydown', handleKey))
</script>
