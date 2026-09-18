<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="neo-card bg-white w-full max-w-lg p-6 space-y-5 animate-scale-in">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b-2 border-zinc-900 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-neo bg-amber-300 border-2 border-zinc-900 shadow-neo-sm flex items-center justify-center text-lg">
                🔗
              </div>
              <div>
                <h2 class="font-extrabold text-sm text-zinc-900">Bagikan Tautan Akses</h2>
                <p class="text-[11px] text-zinc-500 font-medium">Seperti Google Drive — pilih role akses pengguna</p>
              </div>
            </div>
            <button @click="close" class="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-900 font-bold rounded hover:bg-zinc-100 transition-colors">✕</button>
          </div>

          <!-- Folder Info -->
          <div class="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-neo">
            <span class="text-2xl">📁</span>
            <div class="min-w-0">
              <p class="font-bold text-sm text-zinc-900 truncate">{{ folderName }}</p>
              <p class="text-[11px] text-zinc-500 font-mono truncate">{{ folderId }}</p>
            </div>
          </div>

          <!-- Role Selector -->
          <div class="space-y-2">
            <p class="text-xs font-extrabold text-zinc-700 uppercase tracking-wide">Tipe Akses</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="selectedRole = 'viewer'"
                :class="[
                  'p-3 rounded-neo border-2 text-left transition-all space-y-1',
                  selectedRole === 'viewer'
                    ? 'border-zinc-900 bg-amber-300 shadow-neo-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-400'
                ]"
              >
                <div class="flex items-center gap-1.5 font-extrabold text-xs text-zinc-900">
                  <span>👁️</span> Pelihat
                </div>
                <p class="text-[11px] text-zinc-600 leading-snug">Dapat menjelajah, pilih & unduh berkas</p>
              </button>

              <button
                @click="selectedRole = 'editor'"
                :class="[
                  'p-3 rounded-neo border-2 text-left transition-all space-y-1',
                  selectedRole === 'editor'
                    ? 'border-zinc-900 bg-cyan-300 shadow-neo-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-400'
                ]"
              >
                <div class="flex items-center gap-1.5 font-extrabold text-xs text-zinc-900">
                  <span>✏️</span> Editor
                </div>
                <p class="text-[11px] text-zinc-600 leading-snug">Akses penuh: tambah, kelola, & unduh</p>
              </button>
            </div>
          </div>

          <!-- Embed API Key Option -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-extrabold text-zinc-700 uppercase tracking-wide">Sematkan API Key</p>
              <button
                @click="embedApiKey = !embedApiKey"
                :class="[
                  'relative w-10 h-5 rounded-full border-2 border-zinc-900 transition-colors flex items-center',
                  embedApiKey ? 'bg-amber-400' : 'bg-zinc-200'
                ]"
              >
                <span :class="['w-3.5 h-3.5 rounded-full bg-white border border-zinc-900 shadow transition-transform mx-0.5', embedApiKey ? 'translate-x-5' : 'translate-x-0']"></span>
              </button>
            </div>
            <p class="text-[11px] text-zinc-500">
              Jika aktif, API Key akan disertakan dalam tautan sehingga penerima langsung dapat memuat folder tanpa konfigurasi tambahan.
            </p>
            <div v-if="embedApiKey && !gallery.apiKey" class="p-2 bg-rose-50 border border-rose-200 rounded text-[11px] font-semibold text-rose-700 flex items-center gap-1.5">
              <span>⚠️</span> Belum ada API Key yang dikonfigurasi. Buka Pengaturan terlebih dahulu.
            </div>
          </div>

          <!-- Generated Link -->
          <div class="space-y-2">
            <p class="text-xs font-extrabold text-zinc-700 uppercase tracking-wide">Tautan yang Dihasilkan</p>
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-zinc-50 border border-zinc-300 rounded-neo px-3 py-2 text-[11px] font-mono text-zinc-700 truncate select-all">
                {{ generatedLink }}
              </div>
              <button
                @click="handleCopy"
                :class="[
                  'btn-neo text-xs px-3 py-2 flex-shrink-0 transition-all',
                  copied ? 'bg-emerald-300 text-zinc-900' : 'bg-zinc-900 text-white hover:bg-zinc-700'
                ]"
              >
                {{ copied ? '✓ Disalin!' : '📋 Salin' }}
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-2 pt-1 border-t border-zinc-100">
            <button @click="close" class="btn-neo-white text-xs px-4 py-2">Tutup</button>
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGalleryStore } from '@/stores/gallery'
import { generateShareLink, copyToClipboard } from '@/utils/sharelink'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  folderId: { type: String, default: '' },
  folderName: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const gallery = useGalleryStore()
const selectedRole = ref('viewer')
const embedApiKey = ref(false)
const copied = ref(false)

const generatedLink = computed(() => {
  const apiKey = embedApiKey.value ? gallery.apiKey : ''
  return generateShareLink(props.folderId, props.folderName, apiKey, selectedRole.value)
})

async function handleCopy() {
  const ok = await copyToClipboard(generatedLink.value)
  if (ok) {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  }
}

function close() {
  emit('close')
}

watch(() => props.isOpen, (v) => {
  if (v) {
    copied.value = false
    selectedRole.value = 'viewer'
    embedApiKey.value = false
  }
})
</script>
