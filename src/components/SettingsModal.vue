<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="gallery.isSettingsOpen"
        class="modal-overlay"
        @click.self="gallery.isSettingsOpen = false"
      >
        <div class="neo-card p-6 w-full max-w-lg bg-white relative animate-scale-in">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b-2 border-zinc-900 pb-3 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-xl">🔑</span>
              <h2 class="font-extrabold text-base text-zinc-900">Google Drive API Key</h2>
            </div>
            <button
              @click="gallery.isSettingsOpen = false"
              class="w-7 h-7 flex items-center justify-center font-bold text-sm rounded hover:bg-zinc-100 border border-zinc-900"
            >
              ✕
            </button>
          </div>

          <!-- Description -->
          <p class="text-xs text-zinc-600 leading-relaxed mb-4">
            API Key digunakan agar website bisa <strong>otomatis membaca semua foto/video dari dalam folder</strong> dan menampilkan thumbnail mandiri serta fitur <strong>Multi-Select & Download</strong> tanpa membuka tab Google Drive.
          </p>

          <!-- Input field -->
          <div class="space-y-2 mb-4">
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-800">
              API Key Anda
            </label>
            <input
              v-model="inputKey"
              type="text"
              placeholder="Contoh: AIzaSy..."
              class="neo-input font-mono text-xs"
            />
            <p v-if="savedMsg" class="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              ✓ {{ savedMsg }}
            </p>
          </div>

          <!-- Quick Guide -->
          <div class="bg-amber-50 border-2 border-zinc-900 rounded-neo p-3 mb-5 text-[11px] text-zinc-800 space-y-1.5">
            <p class="font-bold flex items-center gap-1">
              <span>💡</span> Cara Dapatkan API Key (Gratis):
            </p>
            <ol class="list-decimal list-inside space-y-1 text-zinc-600 pl-1">
              <li>Buka <a href="https://console.cloud.google.com/" target="_blank" class="text-indigo-600 underline font-semibold">Google Cloud Console</a> & login.</li>
              <li>Buat project baru atau pilih project yang ada.</li>
              <li>Aktifkan <strong>Google Drive API</strong> di library.</li>
              <li>Buka menu <strong>Credentials</strong> &gt; klik <strong>Create Credentials &gt; API key</strong>.</li>
              <li>Pastikan folder Google Drive di-share: <em>"Anyone with the link can view"</em>.</li>
            </ol>
          </div>

          <!-- Buttons -->
          <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
            <button
              @click="gallery.isSettingsOpen = false"
              class="btn-neo-white text-xs px-4 py-2"
            >
              Tutup
            </button>
            <button
              @click="saveKey"
              class="btn-neo-primary text-xs px-4 py-2"
            >
              Simpan API Key
            </button>
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGalleryStore } from '@/stores/gallery'

const gallery = useGalleryStore()
const inputKey = ref('')
const savedMsg = ref('')

onMounted(() => {
  inputKey.value = gallery.apiKey
})

function saveKey() {
  gallery.setApiKey(inputKey.value)
  savedMsg.value = 'API Key berhasil disimpan!'
  setTimeout(() => {
    savedMsg.value = ''
    gallery.isSettingsOpen = false
  }, 1200)
}
</script>
