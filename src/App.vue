<template>
  <div class="min-h-screen flex flex-col selection:bg-amber-300 selection:text-zinc-900">
    
    <!-- Share Mode Banner (Viewer / Editor) -->
    <ShareBanner />

    <!-- Top Navbar -->
    <Navbar @open-share="openShareModal" />

    <!-- Main Content Area -->
    <main class="flex-1 max-w-[1720px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 space-y-4">
      
      <!-- Input Bar: hidden in viewer-only mode -->
      <InputBar v-if="!gallery.isViewerMode" />

      <!-- Folder Tab Bar: hidden in viewer mode -->
      <FolderTabBar v-if="!gallery.isViewerMode" />

      <!-- Gallery Area -->
      <div class="space-y-4">
        <FilterBar v-if="gallery.totalCount > 0" />
        <GalleryGrid />
      </div>

    </main>

    <!-- Bottom Selection Action Bar -->
    <SelectionToolbar />

    <!-- Fullscreen Preview Modal -->
    <FullscreenPreview />

    <!-- Share Link Modal -->
    <ShareLinkModal
      :is-open="shareLinkModal.isOpen"
      :folder-id="shareLinkModal.folderId"
      :folder-name="shareLinkModal.folderName"
      @close="shareLinkModal.isOpen = false"
    />

    <!-- Global Confirm Dialog -->
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

    <!-- Footer -->
    <footer class="py-6 text-center text-xs font-semibold text-zinc-500 border-t-2 border-zinc-900/10 mt-12 bg-white/60 flex flex-col items-center justify-center gap-1.5">
      <p class="text-zinc-700 font-bold">
        GDrive Media Recapper &bull; Dokumentasi &amp; Konten Acara Kampus
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
import { reactive, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import InputBar from '@/components/InputBar.vue'
import FolderTabBar from '@/components/FolderTabBar.vue'
import FilterBar from '@/components/FilterBar.vue'
import GalleryGrid from '@/components/GalleryGrid.vue'
import FullscreenPreview from '@/components/FullscreenPreview.vue'
import SelectionToolbar from '@/components/SelectionToolbar.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import ShareLinkModal from '@/components/ShareLinkModal.vue'
import ShareBanner from '@/components/ShareBanner.vue'
import { useGalleryStore } from '@/stores/gallery'
import { parseShareLink } from '@/utils/sharelink'
import { fetchFolderContents } from '@/utils/gdrive'

const gallery = useGalleryStore()

const shareLinkModal = reactive({
  isOpen: false,
  folderId: '',
  folderName: '',
})

function openShareModal({ folderId, folderName }) {
  shareLinkModal.folderId = folderId
  shareLinkModal.folderName = folderName
  shareLinkModal.isOpen = true
}

function onDialogConfirm() {
  if (gallery.dialog.onConfirm) gallery.dialog.onConfirm()
  gallery.closeModal()
}

function onDialogCancel() {
  if (gallery.dialog.onCancel) gallery.dialog.onCancel()
  gallery.closeModal()
}

// Handle incoming ?share= link on page load
onMounted(async () => {
  const shared = parseShareLink()
  if (!shared) return

  // Set share mode
  gallery.setShareMode(shared.role, shared.name)

  // Auto-apply shared API Key if included
  if (shared.apiKey) {
    gallery.setApiKey(shared.apiKey)
  }

  if (!gallery.apiKey) {
    gallery.showModal({
      title: 'Kunci API Tidak Ditemukan',
      message: 'Tautan berbagi ini tidak menyertakan Google Drive API Key atau konfigurasi environment belum disiapkan.',
      icon: '⚠️',
      confirmText: 'Mengerti',
      showCancel: false
    })
    return
  }

  try {
    const { folderName, items } = await fetchFolderContents(shared.folderId, gallery.apiKey)
    gallery.createTab(shared.folderId, shared.name || folderName, items)
    // Clean URL params from address bar
    window.history.replaceState({}, '', window.location.pathname)
  } catch (e) {
    gallery.showModal({
      title: 'Gagal Memuat Folder Berbagi',
      message: e.message || 'Terjadi kendala saat memuat folder dari tautan berbagi.',
      icon: '❌'
    })
  }
})
</script>
