<template>
  <div class="space-y-3">
    
    <!-- Subfolder Breadcrumbs Bar -->
    <div
      v-if="gallery.folderStack.length > 0"
      class="flex items-center gap-2 px-4 py-2 bg-amber-100/70 border-2 border-zinc-900 rounded-neo shadow-neo-sm overflow-x-auto"
    >
      <span class="text-xs font-bold text-zinc-600 flex items-center gap-1">
        📁 Direktori:
      </span>
      <div class="flex items-center gap-1.5 text-xs font-bold">
        <template v-for="(crumb, idx) in gallery.folderStack" :key="crumb.id">
          <button
            @click="gallery.goToBreadcrumb(idx)"
            :class="[
              'px-2 py-1 rounded transition-colors flex items-center gap-1',
              idx === gallery.folderStack.length - 1
                ? 'bg-amber-300 text-zinc-900 border border-zinc-900 shadow-neo-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
            ]"
          >
            <span>{{ idx === 0 ? '🏠' : '📂' }}</span>
            <span>{{ crumb.name }}</span>
          </button>
          <span v-if="idx < gallery.folderStack.length - 1" class="text-zinc-400">/</span>
        </template>
      </div>

      <span v-if="gallery.isNavigatingFolder" class="ml-auto text-xs font-bold text-zinc-700 animate-pulse flex items-center gap-1">
        <span>⏳</span> Memuat subdirektori...
      </span>
    </div>

    <!-- Filter & Sort Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border-2 border-zinc-900 rounded-neo shadow-neo-sm">
      
      <!-- Left: Filter Tabs -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          @click="gallery.filter = tab.value"
          :class="[
            'px-3 py-1.5 rounded text-xs font-bold transition-all border border-zinc-900 flex items-center gap-1.5',
            gallery.filter === tab.value
              ? 'bg-amber-300 text-zinc-900 shadow-neo-sm'
              : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
          ]"
        >
          <span>{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
          <span class="text-[10px] bg-white px-1.5 py-0.2 rounded border border-zinc-900 font-mono">
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Right: Sorting & Selection Quick Actions -->
      <div class="flex items-center gap-2 justify-end">
        
        <!-- Select All / Deselect All Toggle -->
        <button
          v-if="gallery.filteredItems.some(i => !i.isFolder)"
          @click="toggleSelectAll"
          class="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-900 rounded text-xs font-bold text-zinc-800 transition-colors flex items-center gap-1.5"
        >
          <span>{{ gallery.isAllSelected ? '☒' : '☑' }}</span>
          <span>{{ gallery.isAllSelected ? 'Batalkan Pilihan' : 'Pilih Semua' }}</span>
        </button>

        <!-- Sort Dropdown -->
        <select
          v-model="gallery.sortOrder"
          class="px-2.5 py-1.5 bg-white border border-zinc-900 rounded text-xs font-bold text-zinc-800 outline-none cursor-pointer"
        >
          <option value="newest">↓ Waktu Ditambahkan</option>
          <option value="oldest">↑ Urutan Terlama</option>
          <option value="name">A–Z Nama Berkas</option>
        </select>

      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGalleryStore } from '@/stores/gallery'

const gallery = useGalleryStore()

const filterTabs = computed(() => {
  const tabs = [
    { value: 'all', icon: '🗂️', label: 'Semua Berkas', count: gallery.totalCount },
  ]
  if (gallery.folderCount > 0) {
    tabs.push({ value: 'folder', icon: '📁', label: 'Direktori', count: gallery.folderCount })
  }
  tabs.push(
    { value: 'photo', icon: '📷', label: 'Foto', count: gallery.photoCount },
    { value: 'video', icon: '🎬', label: 'Video', count: gallery.videoCount },
  )
  return tabs
})

function toggleSelectAll() {
  if (gallery.isAllSelected) {
    gallery.deselectAll()
  } else {
    gallery.selectAll()
  }
}
</script>
