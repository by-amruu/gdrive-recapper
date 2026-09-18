<template>
  <div class="space-y-4">
    <!-- Empty State -->
    <div
      v-if="gallery.totalCount === 0"
      class="neo-card p-10 sm:p-14 text-center bg-white border-dashed space-y-3"
    >
      <div class="w-16 h-16 mx-auto rounded-full bg-amber-200 border-2 border-zinc-900 flex items-center justify-center text-3xl shadow-neo-sm">
        📂
      </div>
      <template v-if="gallery.isViewerMode">
        <h3 class="font-extrabold text-base text-zinc-900">Memuat Galeri...</h3>
        <p class="text-xs text-zinc-500 max-w-sm mx-auto">
          Galeri sedang diinisialisasi dari tautan berbagi. Pastikan API Key sudah dikonfigurasi di Pengaturan.
        </p>
      </template>
      <template v-else>
        <h3 class="font-extrabold text-base text-zinc-900">Belum Ada Direktori Dimuat</h3>
        <p class="text-xs text-zinc-500 max-w-sm mx-auto">
          Tempelkan tautan folder Google Drive pada formulir di atas untuk mulai memuat galeri dokumentasi.
        </p>
      </template>
    </div>

    <!-- Filter Zero Match State -->
    <div
      v-else-if="gallery.filteredItems.length === 0"
      class="neo-card p-8 text-center bg-white space-y-2"
    >
      <p class="text-sm font-bold text-zinc-700">Tidak ada berkas yang sesuai dengan kriteria filter</p>
      <button
        @click="gallery.filter = 'all'"
        class="text-xs font-bold text-amber-600 underline"
      >
        Tampilkan seluruh berkas
      </button>
    </div>

    <!-- Bento Masonry Grid dengan Infinite Scroll Cerdas (Lazy Render) -->
    <template v-else>
      <div class="bento-masonry">
        <div
          v-for="item in gallery.visibleItems"
          :key="item.id"
          class="bento-item"
        >
          <MediaCard :item="item" />
        </div>
      </div>

      <!-- Infinite Scroll Trigger Element -->
      <div
        v-if="gallery.hasMoreItems"
        ref="infiniteSentinelRef"
        class="py-8 flex flex-col items-center justify-center gap-2"
      >
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-zinc-900 rounded-neo shadow-neo-sm text-xs font-bold text-zinc-700">
          <span class="animate-spin text-sm">⏳</span>
          <span>Menampilkan berkas selanjutnya ({{ gallery.visibleItems.length }} dari {{ gallery.filteredItems.length }})...</span>
        </div>
      </div>

      <!-- All items loaded note -->
      <div
        v-else-if="gallery.filteredItems.length > 36"
        class="py-6 text-center text-xs font-bold text-zinc-400"
      >
        ✓ Seluruh {{ gallery.filteredItems.length }} berkas telah dimuat sempurna
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useGalleryStore } from '@/stores/gallery'
import MediaCard from '@/components/MediaCard.vue'

const gallery = useGalleryStore()
const infiniteSentinelRef = ref(null)
let observer = null

function setupObserver() {
  if (observer) observer.disconnect()

  observer = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (entry && entry.isIntersecting && gallery.hasMoreItems) {
      gallery.loadMore()
    }
  }, {
    rootMargin: '400px 0px',
    threshold: 0.1
  })

  if (infiniteSentinelRef.value) {
    observer.observe(infiniteSentinelRef.value)
  }
}

onMounted(() => {
  setupObserver()
})

watch(infiniteSentinelRef, (newEl) => {
  if (newEl) setupObserver()
})

watch(() => [gallery.filter, gallery.sortOrder], () => {
  gallery.resetVisibleCount()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>
