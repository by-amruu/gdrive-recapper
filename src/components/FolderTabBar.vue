<template>
  <div v-if="gallery.tabs.length > 0" class="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
    
    <!-- Tab Items -->
    <div
      v-for="(tab, idx) in gallery.tabs"
      :key="tab.id"
      @click="gallery.switchTab(tab.id)"
      :class="[
        'group flex items-center gap-2 px-3.5 py-2 rounded-t-neo border-2 border-zinc-900 font-bold text-xs cursor-pointer transition-all flex-shrink-0',
        gallery.activeTabId === tab.id
          ? 'bg-amber-300 text-zinc-900 border-b-0 shadow-neo-sm -mb-[2px] z-10'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-b-2'
      ]"
    >
      <span class="text-sm">📁</span>
      <span class="max-w-[180px] truncate" :title="tab.name">{{ tab.name }}</span>
      
      <!-- Media Count Badge in Tab -->
      <span class="text-[10px] px-1.5 py-0.2 bg-white/80 border border-zinc-900 rounded font-mono">
        {{ tab.items ? tab.items.length : 0 }}
      </span>

      <!-- Close Tab 'X' Button -->
      <button
        @click.stop="confirmCloseTab(tab)"
        class="w-4 h-4 ml-1 flex items-center justify-center rounded-full hover:bg-rose-400 hover:text-white text-zinc-400 font-extrabold text-[10px] transition-colors"
        title="Tutup tab ini"
      >
        ✕
      </button>
    </div>

    <!-- Active Tab Quick Helper -->
    <div class="ml-auto hidden sm:flex items-center gap-2 text-[11px] font-bold text-zinc-400 pl-2">
      <span>{{ gallery.tabs.length }} Tab Terbuka</span>
    </div>

  </div>
</template>

<script setup>
import { useGalleryStore } from '@/stores/gallery'

const gallery = useGalleryStore()

function confirmCloseTab(tab) {
  gallery.showModal({
    title: 'Tutup Tab Folder?',
    message: `Apakah Anda yakin ingin menutup tab "${tab.name}"? File di dalam tab ini akan dibersihkan dari sesi Anda.`,
    icon: '📂',
    confirmText: 'Tutup Tab',
    isDanger: true,
    showCancel: true,
    onConfirm: () => {
      gallery.closeTab(tab.id)
    }
  })
}
</script>
