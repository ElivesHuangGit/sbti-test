<template>
  <div class="radar-chart-wrapper">
    <canvas ref="canvasRef" :width="size" :height="size"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  // [{name, value}] value: 1=L, 2=M, 3=H
  data: { type: Array, required: true },
  size: { type: Number, default: 340 }
})

const canvasRef = ref(null)

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  canvas.width = props.size * dpr
  canvas.height = props.size * dpr
  canvas.style.width = props.size + 'px'
  canvas.style.height = props.size + 'px'
  ctx.scale(dpr, dpr)

  const cx = props.size / 2
  const cy = props.size / 2
  const maxR = props.size / 2 - 50
  const n = props.data.length
  const angleStep = (Math.PI * 2) / n
  const levels = 3

  ctx.clearRect(0, 0, props.size, props.size)

  // 画背景网格
  for (let lv = 1; lv <= levels; lv++) {
    const r = (maxR * lv) / levels
    ctx.beginPath()
    for (let i = 0; i <= n; i++) {
      const angle = i * angleStep - Math.PI / 2
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.15)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // 画轴线
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle))
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.1)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // 画数据区域
  ctx.beginPath()
  for (let i = 0; i <= n; i++) {
    const idx = i % n
    const angle = idx * angleStep - Math.PI / 2
    const val = props.data[idx].value
    const r = (maxR * val) / levels
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = 'rgba(102, 126, 234, 0.2)'
  ctx.fill()
  ctx.strokeStyle = '#667eea'
  ctx.lineWidth = 2
  ctx.stroke()

  // 画数据点
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - Math.PI / 2
    const val = props.data[i].value
    const r = (maxR * val) / levels
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#667eea'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // 画标签
  ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillStyle = '#999'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - Math.PI / 2
    const labelR = maxR + 30
    const x = cx + labelR * Math.cos(angle)
    const y = cy + labelR * Math.sin(angle)

    // 缩短维度名称显示
    const shortName = props.data[i].name.replace(/^(S\d|E\d|A\d|Ac\d|So\d)\s/, '$1\n')
    const parts = shortName.split('\n')

    if (parts.length > 1) {
      ctx.fillStyle = '#667eea'
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillText(parts[0], x, y - 7)
      ctx.fillStyle = '#888'
      ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillText(parts[1], x, y + 7)
    } else {
      ctx.fillText(shortName, x, y)
    }
  }
}

onMounted(draw)
watch(() => props.data, draw, { deep: true })

defineExpose({ canvasRef })
</script>

<style scoped>
.radar-chart-wrapper {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>
