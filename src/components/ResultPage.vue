<template>
  <div class="result-page">
    <!-- 结果头部 -->
    <div class="result-header">
      <div class="result-badge" :class="badgeClass">
        <span class="badge-code">{{ result.type.code }}</span>
      </div>
      <h1 class="result-title">{{ result.type.cn }}</h1>
      <p class="result-intro">"{{ result.type.intro }}"</p>

      <div class="match-info" v-if="!result.isDrunk">
        <span class="match-tag" v-if="result.similarity">
          匹配度 {{ (result.similarity * 100).toFixed(1) }}%
        </span>
        <span class="match-tag" v-if="result.isHHHH">
          兜底人格
        </span>
      </div>
      <div class="match-info" v-else>
        <span class="match-tag drunk-tag">隐藏人格</span>
      </div>
    </div>

    <!-- 人格描述 -->
    <div class="section-card">
      <h2 class="section-title">人格解读</h2>
      <p class="desc-text">{{ result.type.desc }}</p>
    </div>

    <!-- DRUNK 模式下显示副人格 -->
    <div class="section-card" v-if="result.isDrunk && result.secondaryType">
      <h2 class="section-title">副人格（标准匹配）</h2>
      <div class="secondary-type">
        <span class="secondary-code">{{ result.secondaryType.code }}</span>
        <span class="secondary-name">{{ result.secondaryType.cn }}</span>
        <span class="secondary-sim">{{ (result.similarity * 100).toFixed(1) }}%</span>
      </div>
    </div>

    <!-- 维度模式 -->
    <div class="section-card">
      <h2 class="section-title">你的维度模式</h2>
      <div class="pattern-display">{{ result.userPattern }}</div>
    </div>

    <!-- 雷达图 -->
    <div class="section-card">
      <h2 class="section-title">维度雷达图</h2>
      <RadarChart ref="radarChartRef" :data="radarData" :size="chartSize" />
    </div>

    <!-- 维度详解 -->
    <div class="section-card">
      <h2 class="section-title">十五维度详解</h2>
      <div class="dimensions-list">
        <div
          v-for="item in dimensionExplanations"
          :key="item.dim"
          class="dim-item"
        >
          <div class="dim-header">
            <span class="dim-name">{{ item.name }}</span>
            <span class="dim-level" :class="'level-' + item.level">{{ item.level }}</span>
          </div>
          <div class="dim-model">{{ item.model }}</div>
          <div class="dim-explain">{{ item.explanation }}</div>
        </div>
      </div>
    </div>

    <!-- 匹配排行 -->
    <div class="section-card" v-if="result.rankings && result.rankings.length > 0">
      <h2 class="section-title">匹配排行 TOP5</h2>
      <div class="ranking-list">
        <div
          v-for="(r, idx) in result.rankings"
          :key="r.type.code"
          class="ranking-item"
          :class="{ 'is-best': idx === 0 }"
        >
          <span class="rank-num">#{{ idx + 1 }}</span>
          <span class="rank-code">{{ r.type.code }}</span>
          <span class="rank-name">{{ r.type.cn }}</span>
          <span class="rank-sim">{{ (r.similarity * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="bottom-actions">
      <button class="action-btn save-img-btn" @click="saveImage" :disabled="isSaving">
        <span v-if="isSaving" class="btn-loading"></span>
        <span v-else>{{ saveText }}</span>
      </button>
      <button class="action-btn share-btn" @click="handleShare">
        分享好友
      </button>
      <button class="action-btn restart-btn" @click="$emit('restart')">
        重新测试
      </button>
    </div>

    <p class="footer-disclaimer">
      SBTI 人格测试仅供娱乐，请勿当真。<br>
      原创：B站 @蛆肉儿串儿
    </p>

    <!-- 离屏渲染的保存卡片 -->
    <div class="offscreen-area" v-if="showSaveCard">
      <ResultCard
        ref="resultCardRef"
        :result="result"
        :radar-image="radarImageUrl"
        :test-url="testUrl"
      />
    </div>

    <!-- 保存长图弹窗 -->
    <Teleport to="body">
      <div v-if="showSaveModal" class="save-modal-overlay" @click.self="showSaveModal = false">
        <div class="save-modal">
          <div class="save-modal-header">
            <span class="save-modal-title">长按图片保存</span>
            <button class="save-modal-close" @click="showSaveModal = false">&times;</button>
          </div>
          <div class="save-modal-body">
            <img
              v-if="savedImageUrl"
              :src="savedImageUrl"
              class="save-modal-img"
              alt="SBTI测试结果"
            />
          </div>
          <div class="save-modal-footer">
            <p class="save-modal-hint" v-if="isMobile">长按上方图片 &rarr; 保存到相册</p>
            <button v-else class="save-modal-download" @click="downloadImage">
              下载图片
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 微信分享引导 -->
    <Teleport to="body">
      <div v-if="showWxGuide" class="wx-guide-overlay" @click="showWxGuide = false">
        <div class="wx-guide-arrow">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <path d="M30 50 L30 15 M30 15 L18 27 M30 15 L42 27" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="wx-guide-text">
          点击右上角 <strong>「...」</strong><br>
          选择「发送给朋友」或「分享到朋友圈」
        </div>
        <div class="wx-guide-dismiss">点击任意处关闭</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import html2canvas from 'html2canvas'
import RadarChart from './RadarChart.vue'
import ResultCard from './ResultCard.vue'
import { getDimensionExplanations } from '../engine/scoring.js'
import { dimensionOrder, dimensions } from '../data/dimensions.js'

const props = defineProps({
  result: { type: Object, required: true }
})

defineEmits(['restart'])

// Refs
const radarChartRef = ref(null)
const resultCardRef = ref(null)

// 状态
const isSaving = ref(false)
const saveText = ref('保存长图')
const showSaveCard = ref(false)
const showSaveModal = ref(false)
const showWxGuide = ref(false)
const savedImageUrl = ref('')
const radarImageUrl = ref('')

// 环境检测
const isWeChat = /MicroMessenger/i.test(navigator.userAgent)
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

// 测试地址
const testUrl = computed(() => window.location.origin + window.location.pathname)

const chartSize = computed(() => {
  if (typeof window !== 'undefined' && window.innerWidth < 400) return 300
  return 340
})

const dimensionExplanations = computed(() =>
  getDimensionExplanations(props.result.levels)
)

const radarData = computed(() =>
  dimensionOrder.map(dim => ({
    name: dimensions[dim].name,
    value: props.result.levels[dim] === 'L' ? 1 : props.result.levels[dim] === 'M' ? 2 : 3
  }))
)

const badgeClass = computed(() => {
  if (props.result.isDrunk) return 'badge-drunk'
  if (props.result.isHHHH) return 'badge-hhhh'
  return 'badge-normal'
})

// ---- 保存长图 ----
async function saveImage() {
  if (isSaving.value) return
  isSaving.value = true
  saveText.value = '生成中...'

  try {
    // 1. 从雷达图 canvas 获取图片 dataURL
    const radarCanvas = radarChartRef.value?.canvasRef
    if (radarCanvas) {
      radarImageUrl.value = radarCanvas.toDataURL('image/png')
    }

    // 2. 渲染离屏卡片
    showSaveCard.value = true
    await nextTick()
    // 等一帧确保图片加载
    await new Promise(r => setTimeout(r, 100))

    // 3. 用 html2canvas 截图
    const cardEl = resultCardRef.value?.$el
    if (!cardEl) throw new Error('Card element not found')

    const canvas = await html2canvas(cardEl, {
      scale: 2,
      backgroundColor: '#0f0f18',
      useCORS: true,
      logging: false
    })

    savedImageUrl.value = canvas.toDataURL('image/png')

    // 4. 显示弹窗
    showSaveModal.value = true
    saveText.value = '保存长图'
  } catch (e) {
    console.error('Save image error:', e)
    saveText.value = '生成失败'
    setTimeout(() => { saveText.value = '保存长图' }, 2000)
  } finally {
    isSaving.value = false
    showSaveCard.value = false
  }
}

// 桌面端下载图片
function downloadImage() {
  if (!savedImageUrl.value) return
  const link = document.createElement('a')
  link.download = `SBTI-${props.result.type.code}-${props.result.type.cn}.png`
  link.href = savedImageUrl.value
  link.click()
}

// ---- 分享 ----
async function handleShare() {
  // 微信内置浏览器：显示引导
  if (isWeChat) {
    showWxGuide.value = true
    return
  }

  // 支持 Web Share API 的浏览器（大部分手机浏览器）
  const shareData = {
    title: `我的SBTI人格：【${props.result.type.code}】${props.result.type.cn}`,
    text: `"${props.result.type.intro}" - 快来测测你的SBTI人格吧！`,
    url: window.location.href
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
      return
    } catch {
      // 用户取消或不支持，回退到复制
    }
  }

  // 兜底：复制分享文案
  const text = `我的SBTI人格测试结果：\n【${props.result.type.code}】${props.result.type.cn}\n"${props.result.type.intro}"\n维度模式：${props.result.userPattern}\n快来测测你的人格吧！\n${window.location.href}`
  try {
    await navigator.clipboard.writeText(text)
    alert('分享文案已复制到剪贴板，去粘贴给好友吧！')
  } catch {
    // 剪贴板 API 不可用时手动选中
    prompt('复制以下文案分享给好友：', text)
  }
}
</script>

<style scoped>
.result-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 60px;
}

/* 结果头部 */
.result-header {
  text-align: center;
  padding: 40px 0 32px;
  animation: fadeInUp 0.6s ease-out;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: 20px;
  animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.badge-normal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
}

.badge-drunk {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 8px 32px rgba(245, 87, 108, 0.4);
}

.badge-hhhh {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 8px 32px rgba(79, 172, 254, 0.4);
}

.badge-code {
  font-size: 24px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 2px;
}

.result-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.result-intro {
  font-size: 16px;
  color: var(--text-secondary);
  font-style: italic;
  margin-bottom: 16px;
}

.match-info {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.match-tag {
  font-size: 13px;
  padding: 4px 14px;
  border-radius: 14px;
  background: rgba(102, 126, 234, 0.12);
  color: #667eea;
}

.drunk-tag {
  background: rgba(245, 87, 108, 0.12);
  color: #f5576c;
}

/* 通用卡片 */
.section-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  animation: fadeInUp 0.5s ease-out;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.desc-text {
  font-size: 15px;
  line-height: 2;
  color: var(--text-primary);
}

/* 维度模式 */
.pattern-display {
  font-family: 'Courier New', monospace;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  color: #667eea;
  letter-spacing: 3px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 12px;
}

/* 维度详解 */
.dimensions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dim-item {
  padding: 14px;
  background: var(--bg-primary);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.dim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.dim-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.dim-level {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 10px;
}

.level-L { background: rgba(245, 87, 108, 0.12); color: #f5576c; }
.level-M { background: rgba(255, 184, 0, 0.12); color: #e6a700; }
.level-H { background: rgba(0, 200, 150, 0.12); color: #00c896; }

.dim-model {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.dim-explain {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* 副人格 */
.secondary-type {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 10px;
}

.secondary-code { font-weight: 700; color: #667eea; font-size: 16px; }
.secondary-name { color: var(--text-primary); font-size: 15px; }
.secondary-sim { margin-left: auto; font-size: 13px; color: var(--text-secondary); }

/* 排行 */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-primary);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.ranking-item.is-best {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.06);
}

.rank-num { font-size: 13px; font-weight: 700; color: var(--text-muted); width: 28px; }
.is-best .rank-num { color: #667eea; }
.rank-code { font-weight: 700; color: #667eea; width: 70px; font-size: 14px; }
.rank-name { flex: 1; font-size: 14px; color: var(--text-primary); }
.rank-sim { font-size: 13px; color: var(--text-secondary); font-weight: 600; }

/* ===== 底部操作按钮 ===== */
.bottom-actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
  margin-bottom: 24px;
}

.action-btn {
  flex: 1;
  padding: 14px 8px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.save-img-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}
.save-img-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.save-img-btn:disabled { opacity: 0.6; cursor: wait; }

.share-btn {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
  color: #0a3d2a;
}
.share-btn:hover { opacity: 0.9; transform: translateY(-1px); }

.restart-btn {
  background: var(--card-bg);
  border: 2px solid var(--border-color) !important;
  color: var(--text-primary);
}
.restart-btn:hover { border-color: #667eea !important; color: #667eea; }

.btn-loading {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ===== 离屏渲染区 ===== */
.offscreen-area {
  position: fixed;
  left: -9999px;
  top: 0;
  z-index: -1;
  pointer-events: none;
}

/* ===== 保存长图弹窗 ===== */
.save-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.25s ease-out;
}

.save-modal {
  background: #1a1a24;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.save-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #2a2a3a;
}

.save-modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #e8e8f0;
}

.save-modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #9898a8;
  font-size: 24px;
  cursor: pointer;
  border-radius: 8px;
}
.save-modal-close:hover { background: #2a2a3a; }

.save-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  justify-content: center;
  -webkit-overflow-scrolling: touch;
}

.save-modal-img {
  width: 100%;
  max-width: 375px;
  height: auto;
  border-radius: 8px;
}

.save-modal-footer {
  padding: 12px 20px 16px;
  text-align: center;
  border-top: 1px solid #2a2a3a;
}

.save-modal-hint {
  font-size: 14px;
  color: #9898a8;
}

.save-modal-download {
  padding: 10px 32px;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
.save-modal-download:hover { opacity: 0.9; }

/* ===== 微信分享引导 ===== */
.wx-guide-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-top: 16px;
  padding-right: 20px;
  animation: fadeIn 0.25s ease-out;
}

.wx-guide-arrow {
  animation: bounceUp 1s ease-in-out infinite;
}

.wx-guide-text {
  font-size: 18px;
  color: #fff;
  text-align: right;
  line-height: 1.8;
  margin-top: 12px;
  padding-right: 4px;
}

.wx-guide-text strong {
  color: #43e97b;
}

.wx-guide-dismiss {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  color: #888;
}

.footer-disclaimer {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.8;
}

/* ===== Animations ===== */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes bounceUp {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* ===== 响应式 ===== */
@media (max-width: 420px) {
  .bottom-actions {
    flex-wrap: wrap;
  }
  .save-img-btn,
  .share-btn {
    flex: 1 1 45%;
  }
  .restart-btn {
    flex: 1 1 100%;
  }
}
</style>
