<template>
  <div class="save-card" ref="cardRef">
    <div class="card-header">
      <div class="card-logo">SBTI</div>
      <div class="card-tagline">人格测试结果</div>
    </div>

    <div class="card-type-section">
      <div class="card-emoji">{{ emoji }}</div>
      <div class="card-badge" :class="badgeClass">
        <span>{{ result.type.code }}</span>
      </div>
      <div class="card-type-name">{{ result.type.cn }}</div>
      <div class="card-intro">"{{ result.type.intro }}"</div>
      <div class="card-match" v-if="matchText">{{ matchText }}</div>
    </div>

    <div class="card-radar" v-if="radarImage">
      <img :src="radarImage" class="card-radar-img" />
    </div>

    <div class="card-pattern">{{ result.userPattern }}</div>

    <div class="card-dims">
      <div v-for="group in dimGroups" :key="group.model" class="card-dim-group">
        <div class="card-dim-model">{{ group.model }}</div>
        <div class="card-dim-pills">
          <span v-for="d in group.dims" :key="d.dim" class="card-dim-pill" :class="'pill-' + d.level">
            {{ d.dim }} {{ d.level }}
          </span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="card-footer-left">
        <div class="card-cta">快来测测你的 SBTI 人格吧!</div>
        <div class="card-disclaimer">仅供娱乐 请勿当真</div>
      </div>
      <div class="card-qr">
        <canvas ref="qrCanvasRef"></canvas>
        <div class="card-qr-hint">扫码测试</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import QRCode from 'qrcode'
import { dimensionOrder } from '../data/dimensions.js'
import { typeEmojis } from '../data/typeEmojis.js'

const props = defineProps({
  result: { type: Object, required: true },
  radarImage: { type: String, default: '' },
  testUrl: { type: String, default: '' }
})

const qrCanvasRef = ref(null)

const emoji = computed(() => typeEmojis[props.result.type.code] || '🧩')

function renderQR() {
  if (!qrCanvasRef.value || !props.testUrl) return
  QRCode.toCanvas(qrCanvasRef.value, props.testUrl, {
    width: 80,
    margin: 1,
    color: { dark: '#2d2b28', light: '#f8f6f3' }
  }).catch(() => {})
}

onMounted(renderQR)
watch(() => props.testUrl, renderQR)

const badgeClass = computed(() => {
  if (props.result.isDrunk) return 'badge-drunk'
  if (props.result.isHHHH) return 'badge-hhhh'
  return 'badge-normal'
})

const matchText = computed(() => {
  if (props.result.isDrunk) return '隐藏人格'
  if (props.result.isHHHH) return '兜底人格'
  if (props.result.similarity) return '匹配度 ' + (props.result.similarity * 100).toFixed(1) + '%'
  return ''
})

const dimGroups = computed(() => {
  const groups = [
    { model: '自我模型', dims: ['S1', 'S2', 'S3'] },
    { model: '情感模型', dims: ['E1', 'E2', 'E3'] },
    { model: '态度模型', dims: ['A1', 'A2', 'A3'] },
    { model: '行动驱力', dims: ['Ac1', 'Ac2', 'Ac3'] },
    { model: '社交模型', dims: ['So1', 'So2', 'So3'] }
  ]
  return groups.map(g => ({
    model: g.model,
    dims: g.dims.map(d => ({ dim: d, level: props.result.levels[d] }))
  }))
})
</script>

<style scoped>
.save-card {
  width: 375px;
  background: #f8f6f3;
  color: #2d2b28;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  padding: 32px 24px;
  box-sizing: border-box;
}

.card-header { text-align: center; margin-bottom: 24px; }
.card-logo {
  font-size: 36px; font-weight: 900; letter-spacing: 6px;
  color: #4a7c5e; line-height: 1.2;
}
.card-tagline { font-size: 13px; color: #a09a92; letter-spacing: 3px; margin-top: 4px; }

.card-type-section { text-align: center; margin-bottom: 20px; }
.card-emoji { font-size: 64px; line-height: 1; margin-bottom: 12px; }
.card-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 72px; height: 72px; border-radius: 50%;
  margin-bottom: 12px; font-size: 16px; font-weight: 900; color: #fff; letter-spacing: 1px;
}
.badge-normal { background: linear-gradient(135deg, #4a7c5e, #3a8a6a); }
.badge-drunk { background: linear-gradient(135deg, #e8a849, #d4903a); }
.badge-hhhh { background: linear-gradient(135deg, #5ba4cf, #4a8cb8); }

.card-type-name { font-size: 24px; font-weight: 800; margin-bottom: 6px; }
.card-intro { font-size: 13px; color: #6b6862; font-style: italic; margin-bottom: 8px; padding: 0 12px; }
.card-match {
  display: inline-block; font-size: 12px; padding: 3px 14px; border-radius: 12px;
  background: #e6f0ea; color: #4a7c5e;
}

.card-radar { text-align: center; margin: 16px 0; }
.card-radar-img { width: 260px; height: 260px; }

.card-pattern {
  font-family: 'Courier New', monospace; font-size: 16px; font-weight: 700;
  text-align: center; color: #4a7c5e; letter-spacing: 2px;
  padding: 10px; background: #e6f0ea; border-radius: 10px; margin-bottom: 18px;
}

.card-dims { margin-bottom: 20px; }
.card-dim-group { display: flex; align-items: center; gap: 10px; margin-bottom: 7px; }
.card-dim-model { font-size: 11px; color: #a09a92; width: 56px; flex-shrink: 0; text-align: right; }
.card-dim-pills { display: flex; gap: 5px; flex: 1; }
.card-dim-pill {
  font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px;
  flex: 1; text-align: center;
}
.pill-L { background: #fce8e6; color: #c0614e; }
.pill-M { background: #fef6e0; color: #b8920a; }
.pill-H { background: #e6f0ea; color: #4a7c5e; }

.card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 18px; border-top: 1px solid #e8e3dc; gap: 12px;
}
.card-footer-left { flex: 1; }
.card-cta { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.card-disclaimer { font-size: 10px; color: #a09a92; }
.card-qr { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
.card-qr canvas { border-radius: 6px; }
.card-qr-hint { font-size: 10px; color: #a09a92; margin-top: 4px; }
</style>
