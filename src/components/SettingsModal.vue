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
              <h2 class="font-extrabold text-base text-zinc-900">Konfigurasi Google Drive API</h2>
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
            Kredensial API Key digunakan oleh peramban untuk membaca metadata dan berkas dari direktori Google Drive publik secara langsung, memungkinkan ekstraksi multi-berkas serta pengunduhan arsip massal.
          </p>

          <!-- Input field -->
          <div class="space-y-2 mb-4">
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-800">
              Kunci API (API Key)
            </label>
            <input
              v-model="inputKey"
              type="text"
              placeholder="Masukkan API Key (AIzaSy...)"
              class="neo-input font-mono text-xs"
            />
            <p v-if="savedMsg" class="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              ✓ {{ savedMsg }}
            </p>
          </div>

          <!-- Quick Guide -->
          <div class="bg-amber-50 border-2 border-zinc-900 rounded-neo p-3.5 mb-5 text-[11px] text-zinc-800 space-y-1.5">
            <p class="font-bold flex items-center gap-1">
              <span>💡</span> Panduan Pembuatan Kunci API:
            </p>
            <ol class="list-decimal list-inside space-y-1 text-zinc-600 pl-1">
              <li>Akses konsol resmi <a href="https://console.cloud.google.com/" target="_blank" class="text-indigo-600 underline font-semibold">Google Cloud Console</a>.</li>
              <li>Pilih atau inisialisasi proyek baru.</li>
              <li>Aktifkan API <strong>Google Drive API</strong> pada pustaka layanan.</li>
              <li>Masuk ke menu <strong>Credentials</strong> &gt; pilih <strong>Create Credentials &gt; API key</strong>.</li>
              <li>Pastikan direktori Google Drive yang diakses telah diatur hak akses publik: <em>"Anyone with the link can view"</em>.</li>
            </ol>
          </div>

          <!-- Buttons -->
          <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
            <button
              @click="gallery.isSettingsOpen = false"
              class="btn-neo-white text-xs px-4 py-2"
            >
              Batal
            </button>
            <button
              @click="saveKey"
              class="btn-neo-primary text-xs px-4 py-2"
            >
              Simpan Konfigurasi
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
  savedMsg.value = 'Konfigurasi kredensial berhasil disimpan!'
  setTimeout(() => {
    savedMsg.value = ''
    gallery.isSettingsOpen = false
  }, 1000)
}
</script>
