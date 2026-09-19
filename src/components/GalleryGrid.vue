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

    <!-- Grid Gallery dengan Pagination 500 Berkas -->
    <template v-else>
      <!-- Top Pagination Info & Controls (Shown if more than 500 items) -->
      <div
        v-if="gallery.totalPages > 1"
        class="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border-2 border-zinc-900 rounded-neo shadow-neo-sm"
      >
        <div class="flex items-center gap-2 text-xs font-bold text-zinc-800">
          <span class="px-2 py-0.5 bg-amber-200 border border-zinc-900 rounded font-mono">
            Hal. {{ gallery.currentPage }} / {{ gallery.totalPages }}
          </span>
          <span class="text-zinc-500">
            (Menampilkan {{ gallery.pageStartIndex + 1 }} - {{ gallery.pageEndIndex }} dari {{ gallery.filteredItems.length }} berkas)
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <button
            @click="gallery.prevPage"
            :disabled="gallery.currentPage === 1"
            class="btn-neo text-xs px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Sebelumnya
          </button>

          <!-- Page select dropdown for quick jump -->
          <select
            :value="gallery.currentPage"
            @change="gallery.setPage(Number($event.target.value))"
            class="text-xs font-bold bg-white border-2 border-zinc-900 rounded-neo px-2 py-1 shadow-neo-sm cursor-pointer"
          >
            <option v-for="p in gallery.totalPages" :key="p" :value="p">
              Halaman {{ p }}
            </option>
          </select>

          <button
            @click="gallery.nextPage"
            :disabled="gallery.currentPage === gallery.totalPages"
            class="btn-neo text-xs px-3 py-1.5 bg-amber-300 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Selanjutnya →
          </button>
        </div>
      </div>

      <!-- Natural Grid Item Flow -->
      <div class="bento-masonry">
        <div
          v-for="item in gallery.paginatedItems"
          :key="item.id"
          class="bento-item"
        >
          <MediaCard :item="item" />
        </div>
      </div>

      <!-- Bottom Pagination Bar -->
      <div
        v-if="gallery.totalPages > 1"
        class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white border-2 border-zinc-900 rounded-neo shadow-neo mt-6"
      >
        <div class="text-xs font-bold text-zinc-700 text-center sm:text-left">
          Halaman <span class="font-extrabold text-zinc-900">{{ gallery.currentPage }}</span> dari <span class="font-extrabold text-zinc-900">{{ gallery.totalPages }}</span>
          <span class="text-zinc-500 font-normal ml-1">({{ gallery.pageStartIndex + 1 }}–{{ gallery.pageEndIndex }} dari {{ gallery.filteredItems.length }} media)</span>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="gallery.setPage(1)"
            :disabled="gallery.currentPage === 1"
            class="btn-neo-white text-xs px-2.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Ke Halaman Pertama"
          >
            « Awal
          </button>
          <button
            @click="gallery.prevPage"
            :disabled="gallery.currentPage === 1"
            class="btn-neo bg-zinc-100 hover:bg-zinc-200 text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Sebelumnya
          </button>

          <span class="text-xs font-extrabold px-3 py-1 bg-amber-300 border-2 border-zinc-900 rounded-neo shadow-neo-sm font-mono">
            {{ gallery.currentPage }}
          </span>

          <button
            @click="gallery.nextPage"
            :disabled="gallery.currentPage === gallery.totalPages"
            class="btn-neo bg-amber-300 hover:bg-amber-400 text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Selanjutnya →
          </button>
          <button
            @click="gallery.setPage(gallery.totalPages)"
            :disabled="gallery.currentPage === gallery.totalPages"
            class="btn-neo-white text-xs px-2.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Ke Halaman Terakhir"
          >
            Akhir »
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useGalleryStore } from '@/stores/gallery'
import MediaCard from '@/components/MediaCard.vue'

const gallery = useGalleryStore()
</script>
