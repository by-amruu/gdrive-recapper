<template>
  <div class="min-h-screen flex flex-col selection:bg-amber-300 selection:text-zinc-900">
    
    <!-- Top Navbar -->
    <Navbar />

    <!-- Main Content Area -->
    <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-4">
      
      <!-- Input Bar (Folder / File URL) -->
      <InputBar />

      <!-- Window Tabs Bar: 1 Folder = 1 Tab -->
      <FolderTabBar />

      <!-- View: Split Screen Mode -->
      <div v-if="gallery.viewMode === 'splitscreen'">
        <SplitScreen />
      </div>

      <!-- View: Grid Gallery Mode -->
      <div v-else class="space-y-4">
        <!-- Filter & Quick Action Bar with Breadcrumbs -->
        <FilterBar v-if="gallery.totalCount > 0" />

        <!-- Media Grid -->
        <GalleryGrid />
      </div>

    </main>

    <!-- Bottom Selection Action Bar (Appears when photos are selected) -->
    <SelectionToolbar />

    <!-- Fullscreen Native Image/Video Preview Modal -->
    <FullscreenPreview />

    <!-- Settings API Key Modal -->
    <SettingsModal />

    <!-- Global Custom Confirm/Alert Dialog Modal -->
    <ConfirmModal
      :is-open="gallery.dialog.isOpen"
      :title="gallery.dialog.title"
      :message="gallery.dialog.message"
      :icon="gallery.dialog.icon"
      :confirm-text="gallery.dialog.confirmText"
      :cancel-text="gallery.dialog.cancelText"
      :show-cancel="gallery.dialog.showCancel"
      :is-danger="gallery.dialog.isDanger"
      @confirm="onDialogConfirm"
      @cancel="onDialogCancel"
    />

    <!-- Footer with Creator Credit -->
    <footer class="py-6 text-center text-xs font-semibold text-zinc-500 border-t-2 border-zinc-900/10 mt-12 bg-white/60 flex flex-col items-center justify-center gap-1.5">
      <p class="text-zinc-700 font-bold">
        GDrive Media Recapper &bull; Dokumentasi & Konten Acara Kampus
      </p>
      <p class="text-zinc-500 text-[11px] flex items-center gap-1">
        Dibuat oleh
        <a
          href="https://instagram.com/by.amruu"
          target="_blank"
          rel="noopener noreferrer"
          class="font-extrabold text-zinc-900 bg-amber-300 px-2 py-0.5 border border-zinc-900 rounded hover:bg-amber-400 transition-colors shadow-neo-sm"
        >
          @by.amruu
        </a>
      </p>
    </footer>

  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import InputBar from '@/components/InputBar.vue'
import FolderTabBar from '@/components/FolderTabBar.vue'
import FilterBar from '@/components/FilterBar.vue'
import GalleryGrid from '@/components/GalleryGrid.vue'
import SplitScreen from '@/components/SplitScreen.vue'
import FullscreenPreview from '@/components/FullscreenPreview.vue'
import SelectionToolbar from '@/components/SelectionToolbar.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { useGalleryStore } from '@/stores/gallery'

const gallery = useGalleryStore()

function onDialogConfirm() {
  if (gallery.dialog.onConfirm) {
    gallery.dialog.onConfirm()
  }
  gallery.closeModal()
}

function onDialogCancel() {
  if (gallery.dialog.onCancel) {
    gallery.dialog.onCancel()
  }
  gallery.closeModal()
}
</script>
