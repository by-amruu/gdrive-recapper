<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpen"
        class="modal-overlay"
        @click.self="handleCancel"
      >
        <div class="neo-card p-6 w-full max-w-md bg-white relative animate-scale-in">
          
          <div class="flex items-center gap-3 border-b-2 border-zinc-900 pb-3 mb-4">
            <span class="text-2xl">{{ icon }}</span>
            <h3 class="font-extrabold text-base text-zinc-900">{{ title }}</h3>
          </div>

          <p class="text-xs text-zinc-600 leading-relaxed mb-6 font-medium">
            {{ message }}
          </p>

          <div class="flex items-center justify-end gap-2.5">
            <button
              v-if="showCancel"
              @click="handleCancel"
              class="btn-neo-white text-xs px-4 py-2"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              :class="[
                'text-xs px-4 py-2',
                isDanger ? 'btn-neo-danger' : 'btn-neo-primary'
              ]"
            >
              {{ confirmText }}
            </button>
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: '' },
  icon: { type: String, default: '⚠️' },
  confirmText: { type: String, default: 'Ya, Lanjutkan' },
  cancelText: { type: String, default: 'Batal' },
  showCancel: { type: Boolean, default: true },
  isDanger: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}
</script>
