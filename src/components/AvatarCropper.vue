<template>
  <teleport to="body">
    <div class="cropper-overlay" @click.self="$emit('close')">
      <div class="cropper-box">
        <h3 class="cropper-title">裁剪头像</h3>
        <div class="cropper-viewport" ref="viewport">
          <img
            :src="imageSrc"
            :style="imgStyle"
            @mousedown="startDrag"
            @touchstart.prevent="startDragTouch"
            draggable="false"
            ref="imgRef"
          />
          <div class="cropper-mask">
            <div class="crop-circle" />
          </div>
        </div>
        <div class="cropper-controls">
          <el-icon><ZoomOut /></el-icon>
          <input type="range" min="50" max="300" :value="zoom" @input="zoom = +$event.target.value" class="zoom-slider" />
          <el-icon :size="18"><ZoomIn /></el-icon>
          <span class="zoom-label">{{ zoom }}%</span>
        </div>
        <div class="cropper-btns">
          <el-button @click="$emit('close')">取消</el-button>
          <el-button type="primary" @click="doCrop" :loading="cropping">确认裁剪</el-button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ZoomIn, ZoomOut } from '@element-plus/icons-vue'

const props = defineProps({ file: File })
const emit = defineEmits(['cropped', 'close'])

const imageSrc = ref('')
const imgRef = ref(null)
const viewport = ref(null)
const zoom = ref(100)
const offsetX = ref(0)
const offsetY = ref(0)
const cropping = ref(false)

const imgStyle = computed(() => ({
  transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${zoom.value / 100})`,
  transformOrigin: 'center center'
}))

// Drag state
let dragging = false, startX = 0, startY = 0, origX = 0, origY = 0

function startDrag(e) {
  dragging = true; startX = e.clientX; startY = e.clientY; origX = offsetX.value; origY = offsetY.value
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}
function startDragTouch(e) {
  if (e.touches.length === 1) {
    dragging = true; startX = e.touches[0].clientX; startY = e.touches[0].clientY; origX = offsetX.value; origY = offsetY.value
    window.addEventListener('touchmove', onDragTouch)
    window.addEventListener('touchend', stopDragTouch)
  }
}
function onDrag(e) { if (dragging) { offsetX.value = origX + (e.clientX - startX); offsetY.value = origY + (e.clientY - startY) } }
function stopDrag() { dragging = false; window.removeEventListener('mousemove', onDrag); window.removeEventListener('mouseup', stopDrag) }
function onDragTouch(e) { if (dragging) { offsetX.value = origX + (e.touches[0].clientX - startX); offsetY.value = origY + (e.touches[0].clientY - startY) } }
function stopDragTouch() { dragging = false; window.removeEventListener('touchmove', onDragTouch); window.removeEventListener('touchend', stopDragTouch) }

function doCrop() {
  cropping.value = true
  const img = imgRef.value
  const vp = viewport.value
  const vpW = vp.clientWidth
  const vpH = vp.clientHeight

  // Circle mask is 200px diameter, fixed in CSS
  const circleDia = 200
  const circleR = circleDia / 2
  const s = zoom.value / 100

  // Image CSS box: 300x300 centered in viewport
  // After transform: center at (vpW/2+offsetX, vpH/2+offsetY), scaled by s
  const boxCX = vpW / 2 + offsetX.value
  const boxCY = vpH / 2 + offsetY.value

  // Circle center is viewport center
  // Circle top-left in image-box-local coords (before CSS scale)
  const cxInBox = (vpW / 2 - circleR - boxCX) / s + 150
  const cyInBox = (vpH / 2 - circleR - boxCY) / s + 150
  const cwInBox = circleDia / s
  const chInBox = circleDia / s

  // object-fit: contain — image may not fill the full 300x300 box
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const fit = Math.min(300 / iw, 300 / ih)
  const fitW = iw * fit
  const fitH = ih * fit
  const padX = (300 - fitW) / 2
  const padY = (300 - fitH) / 2

  // Map box coords to source image coords
  let srcX = (cxInBox - padX) / fit
  let srcY = (cyInBox - padY) / fit
  let srcW = cwInBox / fit
  let srcH = chInBox / fit

  // Clamp to image bounds
  if (srcX < 0) { srcW += srcX; srcX = 0 }
  if (srcY < 0) { srcH += srcY; srcY = 0 }
  if (srcX + srcW > iw) srcW = iw - srcX
  if (srcY + srcH > ih) srcH = ih - srcY

  const canvas = document.createElement('canvas')
  canvas.width = 300; canvas.height = 300
  const ctx = canvas.getContext('2d')

  // White background, then clip to circle
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 300, 300)
  ctx.beginPath()
  ctx.arc(150, 150, 150, 0, Math.PI * 2)
  ctx.clip()

  // Compute destination rect to fill the circle proportionally
  const dstScale = Math.max(300 / srcW, 300 / srcH)
  const dstW = srcW * dstScale
  const dstH = srcH * dstScale
  const dstX = (300 - dstW) / 2
  const dstY = (300 - dstH) / 2

  ctx.drawImage(img, Math.round(srcX), Math.round(srcY), Math.round(srcW), Math.round(srcH), Math.round(dstX), Math.round(dstY), Math.round(dstW), Math.round(dstH))
  canvas.toBlob(blob => {
    cropping.value = false
    if (blob) emit('cropped', blob)
  }, 'image/jpeg', 0.85)
}

// Read file as data URL
watch(() => props.file, f => {
  if (!f) return
  const reader = new FileReader()
  reader.onload = e => { imageSrc.value = e.target.result; offsetX.value = 0; offsetY.value = 0; zoom.value = 100 }
  reader.readAsDataURL(f)
}, { immediate: true })
</script>

<style scoped>
.cropper-overlay {
  position: fixed; inset: 0; z-index: 3000;
  background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
}
.cropper-box {
  background: var(--bg-card); border-radius: var(--radius-lg);
  padding: 24px; width: 420px; max-width: 95vw;
}
.cropper-title { margin: 0 0 16px; font-size: 16px; }
.cropper-viewport {
  position: relative; width: 100%; height: 320px;
  overflow: hidden; background: #000; border-radius: 8px;
  cursor: grab; user-select: none;
}
.cropper-viewport:active { cursor: grabbing; }
.cropper-viewport img {
  position: absolute; left: 50%; top: 50%;
  margin-left: -150px; margin-top: -150px;
  width: 300px; height: 300px; object-fit: contain;
}
.cropper-mask {
  position: absolute; inset: 0; pointer-events: none;
  box-shadow: 0 0 0 9999px rgba(0,0,0,.45);
  border-radius: 50%; overflow: hidden;
  width: 200px; height: 200px;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
}
.crop-circle {
  width: 200px; height: 200px;
  border: 2px dashed rgba(255,255,255,.7);
  border-radius: 50%;
}
.cropper-controls {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 0; justify-content: center;
}
.zoom-slider { flex: 1; max-width: 200px; accent-color: var(--primary); }
.zoom-label { font-size: 12px; color: var(--text-muted); min-width: 36px; }
.cropper-btns { display: flex; justify-content: flex-end; gap: 8px; }
</style>
