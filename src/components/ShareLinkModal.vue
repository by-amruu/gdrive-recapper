<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="neo-card bg-white w-full max-w-md mx-4 p-5 space-y-5 animate-scale-in">

          <!-- Header -->
          <div class="flex items-center justify-between border-b-2 border-zinc-900 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-neo bg-amber-300 border-2 border-zinc-900 shadow-neo-sm flex items-center justify-center text-lg">
                🔗
              </div>
              <div>
                <h2 class="font-extrabold text-sm text-zinc-900">Bagikan Tautan Akses</h2>
                <p class="text-[11px] text-zinc-500 font-medium">Pilih level akses untuk penerima tautan</p>
              </div>
            </div>
            <button @click="close" class="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-900 font-bold rounded hover:bg-zinc-100 transition-colors">✕</button>
          </div>

          <!-- Folder Info -->
          <div class="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-neo">
            <span class="text-2xl flex-shrink-0">📁</span>
            <div class="min-w-0">
              <p class="font-bold text-sm text-zinc-900 truncate">{{ folderName }}</p>
              <p class="text-[11px] text-zinc-400 font-mono truncate">id: {{ folderId.slice(0, 20) }}…</p>
            </div>
          </div>

          <!-- Notice -->
          <div class="p-3 bg-emerald-50 border border-emerald-300 rounded-neo flex items-start gap-2">
            <span class="text-base flex-shrink-0">🚀</span>
            <p class="text-[11px] text-emerald-900 leading-snug">
              <strong class="font-extrabold">Tautan Pelihat Langsung Aktif!</strong> Penerima dapat langsung membuka dokumentasi Google Drive ini, melihat, dan memilih berkas untuk diunduh tanpa perlu input API Key!
            </p>
          </div>

          <!-- Generated Link & Formatted Message -->
          <div class="space-y-3">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <p class="text-xs font-extrabold text-zinc-700 uppercase tracking-wide">Pesan Siap Kirim (WhatsApp / Chat)</p>
                <span class="text-[10px] text-zinc-400 font-medium">Lengkap dengan judul folder</span>
              </div>
              <div class="bg-zinc-50 border-2 border-zinc-900 rounded-neo p-3 text-[11px] text-zinc-800 font-mono leading-relaxed space-y-1 select-all">
                <p class="font-bold text-zinc-900">📂 Dokumentasi: {{ folderName }}</p>
                <p class="text-zinc-600">Akses &amp; unduh foto/video acara resolusi tinggi di sini:</p>
                <p class="text-indigo-600 break-all underline">{{ generatedLink }}</p>
              </div>
            </div>

            <div class="flex items-stretch gap-2 pt-1">
              <button
                @click="handleCopyMessage"
                :class="[
                  'btn-neo text-xs flex-1 py-2.5 flex items-center justify-center gap-2 transition-all',
                  copiedMsg ? 'bg-emerald-300 text-zinc-900' : 'bg-amber-300 hover:bg-amber-400 text-zinc-900'
                ]"
              >
                <span>{{ copiedMsg ? '✅' : '📋' }}</span>
                <span class="font-bold">{{ copiedMsg ? 'Pesan Lengkap Disalin!' : 'Salin Pesan + Tautan' }}</span>
              </button>
              <button
                @click="handleCopyLinkOnly"
                :class="[
                  'btn-neo-white text-xs px-3 py-2.5 flex-shrink-0 transition-all text-zinc-700',
                  copiedLink ? 'bg-emerald-100 border-emerald-600 text-emerald-900' : ''
                ]"
                title="Hanya salin alamat tautan saja"
              >
                {{ copiedLink ? '✓ Link Disalin' : 'Hanya Link' }}
              </button>
            </div>
          </div>

          <!-- Close -->
          <div class="flex justify-end pt-1 border-t border-zinc-100">
            <button @click="close" class="btn-neo-white text-xs px-4 py-2">Tutup</button>
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { generateShareLink, copyToClipboard } from '@/utils/sharelink'
import { useGalleryStore } from '@/stores/gallery'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  folderId: { type: String, default: '' },
  folderName: { type: String, default: '' },
})

const emit = defineEmits(['close'])
const gallery = useGalleryStore()

const copiedMsg = ref(false)
const copiedLink = ref(false)

// Direct viewer link with API key included automatically
const generatedLink = computed(() =>
  generateShareLink(props.folderId, props.folderName, gallery.apiKey, 'viewer')
)

const fullMessage = computed(() => {
  return `📂 Dokumentasi: ${props.folderName}\nAkses & unduh foto/video acara resolusi tinggi di sini:\n${generatedLink.value}`
})

async function handleCopyMessage() {
  const ok = await copyToClipboard(fullMessage.value)
  if (ok) {
    copiedMsg.value = true
    setTimeout(() => { copiedMsg.value = false }, 2500)
  }
}

async function handleCopyLinkOnly() {
  const ok = await copyToClipboard(generatedLink.value)
  if (ok) {
    copiedLink.value = true
    setTimeout(() => { copiedLink.value = false }, 2500)
  }
}

function close() { emit('close') }

watch(() => props.isOpen, (v) => {
  if (v) {
    copiedMsg.value = false
    copiedLink.value = false
  }
})
</script>
