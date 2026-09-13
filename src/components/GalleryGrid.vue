<template>
  <div class="space-y-4">
    <!-- Empty State -->
    <div
      v-if="gallery.totalCount === 0"
      class="neo-card p-12 text-center bg-white border-dashed space-y-3"
    >
      <div class="w-16 h-16 mx-auto rounded-full bg-amber-200 border-2 border-zinc-900 flex items-center justify-center text-3xl shadow-neo-sm">
        📂
      </div>
      <h3 class="font-extrabold text-base text-zinc-900">Galeri Masih Kosong</h3>
      <p class="text-xs text-zinc-500 max-w-sm mx-auto">
        Masukkan link Google Drive folder dokumentasi atau foto di formulir di atas untuk mulai melihat preview dan download.
      </p>
    </div>

    <!-- Filter Zero Match State -->
    <div
      v-else-if="gallery.filteredItems.length === 0"
      class="neo-card p-8 text-center bg-white space-y-2"
    >
      <p class="text-sm font-bold text-zinc-700">Tidak ada media untuk kategori ini</p>
      <button
        @click="gallery.filter = 'all'"
        class="text-xs font-bold text-amber-600 underline"
      >
        Tampilkan semua media
      </button>
    </div>

    <!-- Bento Masonry Grid (Fleksibel mengikuti rasio asli masing-masing foto/video) -->
    <div
      v-else
      class="bento-masonry"
    >
      <div
        v-for="item in gallery.filteredItems"
        :key="item.id"
        class="bento-item"
      >
        <MediaCard :item="item" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGalleryStore } from '@/stores/gallery'
import MediaCard from '@/components/MediaCard.vue'

const gallery = useGalleryStore()
</script>
