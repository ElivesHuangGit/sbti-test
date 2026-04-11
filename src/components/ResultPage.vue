<template>
  <div class="result-page">

    <!-- ===== 英雄头图区 (双列布局) ===== -->
    <div class="hero-card">
      <div class="hero-illustration" :style="illustrationStyle">
        <div class="hero-emoji">{{ emoji }}</div>
        <div class="hero-intro">{{ result.type.intro }}</div>
      </div>
      <div class="hero-info">
        <div class="hero-label">你的主类型</div>
        <h1 class="hero-type-name">{{ result.type.code }}（{{ result.type.cn }}）</h1>
        <div class="hero-tags">
          <span class="hero-tag" v-if="result.isDrunk">隐藏人格</span>
          <span class="hero-tag" v-else-if="result.isHHHH">兜底人格</span>
          <span class="hero-tag" v-else-if="result.similarity">
            匹配度 {{ (result.similarity * 100).toFixed(0) }}%
            <template v-if="result.exactCount"> · 精准命中 {{ result.exactCount }}/15 维</template>
          </span>
        </div>
        <p class="hero-desc">{{ matchDescription }}</p>
      </div>
    </div>

    <!-- 广告位 -->
    <div class="ad-slot" v-show="adsReady">
      <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2902494670421661" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>
    </div>

    <!-- ===== 人格解读 ===== -->
    <div class="section-card">
      <h2 class="section-title">该人格的简单解读</h2>
      <p class="desc-text">{{ result.type.desc }}</p>
    </div>

    <!-- DRUNK 副人格 -->
    <div class="section-card" v-if="result.isDrunk && result.secondaryType">
      <h2 class="section-title">副人格（标准匹配）</h2>
      <div class="secondary-type">
        <span class="secondary-code">{{ result.secondaryType.code }}</span>
        <span class="secondary-name">{{ result.secondaryType.cn }}</span>
        <span class="secondary-sim">{{ (result.similarity * 100).toFixed(1) }}%</span>
      </div>
    </div>

    <!-- ===== 十五维度评分 ===== -->
    <div class="section-card">
      <h2 class="section-title">十五维度评分</h2>
      <div class="dimensions-list">
        <div v-for="item in dimensionExplanations" :key="item.dim" class="dim-item">
          <div class="dim-header">
            <span class="dim-name"><strong>{{ item.dim }}</strong> {{ item.shortLabel }}</span>
            <span class="dim-score" :class="'score-' + item.level">{{ item.level }} / {{ item.rawScore }}分</span>
          </div>
          <div class="dim-explain">{{ item.explanation }}</div>
        </div>
      </div>
    </div>

    <!-- ===== 雷达图 ===== -->
    <div class="section-card">
      <h2 class="section-title">维度雷达图</h2>
      <RadarChart ref="radarChartRef" :data="radarData" :size="chartSize" />
    </div>

    <!-- ===== 维度模式 ===== -->
    <div class="section-card">
      <h2 class="section-title">你的维度模式</h2>
      <div class="pattern-display">{{ result.userPattern }}</div>
    </div>

    <!-- 广告位 2 -->
    <div class="ad-slot">
      <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2902494670421661" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>
    </div>

    <!-- ===== 匹配排行 ===== -->
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

    <!-- ===== 邀请好友 ===== -->
    <div class="invite-card">
      <div class="invite-text">你的好友是什么抽象人格？</div>
      <div class="invite-sub">分享给 TA 测一测，看看你们匹配度如何</div>
      <div class="invite-actions">
        <button class="invite-btn" @click="copyLink">复制链接发给好友</button>
      </div>
    </div>

    <!-- ===== 底部操作 ===== -->
    <div class="bottom-actions">
      <button class="action-btn save-img-btn" @click="saveImage" :disabled="isSaving">
        <span v-if="isSaving" class="btn-loading"></span>
        <span v-else>{{ saveText }}</span>
      </button>
      <button class="action-btn share-btn" @click="handleShare">分享好友</button>
      <button class="action-btn restart-btn" @click="$emit('restart')">重新测试</button>
    </div>

    <!-- 赞赏区 -->
    <div class="tip-card" v-if="!showTipQR">
      <div class="tip-text">觉得好玩？请作者喝杯咖啡 ☕</div>
      <button class="tip-btn" @click="showTipQR = true">打赏支持</button>
    </div>
    <div class="tip-card tip-qr-card" v-else>
      <div class="tip-text">感谢支持！扫码打赏 ❤️</div>
      <div class="tip-qr-row">
        <div class="tip-qr-item">
          <img src="/tip-wechat.jpg?v=3" class="tip-qr-img" alt="微信赞赏" />
          <span>微信</span>
        </div>
        <div class="tip-qr-item">
          <img src="/tip-alipay.jpg" class="tip-qr-img" alt="支付宝赞赏" />
          <span>支付宝</span>
        </div>
      </div>
      <button class="tip-close" @click="showTipQR = false">收起</button>
    </div>

    <p class="footer-disclaimer">
      SBTI 人格测试仅供娱乐，请勿当真。<br>原创：B站 @蛆肉儿串儿
    </p>

    <!-- 离屏卡片 -->
    <div class="offscreen-area" v-if="showSaveCard">
      <ResultCard ref="resultCardRef" :result="result" :radar-image="radarImageUrl" :test-url="testUrl" />
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
            <img v-if="savedImageUrl" :src="savedImageUrl" class="save-modal-img" alt="SBTI测试结果" />
          </div>
          <div class="save-modal-footer">
            <p class="save-modal-hint" v-if="isMobile">长按上方图片 &rarr; 保存到相册</p>
            <button v-else class="save-modal-download" @click="downloadImage">下载图片</button>
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
          点击右上角 <strong>「...」</strong><br>选择「发送给朋友」或「分享到朋友圈」
        </div>
        <div class="wx-guide-dismiss">点击任意处关闭</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, onMounted } from 'vue'
import html2canvas from 'html2canvas'
import RadarChart from './RadarChart.vue'
import ResultCard from './ResultCard.vue'
import { getDimensionExplanations } from '../engine/scoring.js'
import { dimensionOrder, dimensions } from '../data/dimensions.js'
import { typeEmojis, typeBgColors } from '../data/typeEmojis.js'

const props = defineProps({ result: { type: Object, required: true } })
defineEmits(['restart'])

const radarChartRef = ref(null)
const resultCardRef = ref(null)
const isSaving = ref(false)
const saveText = ref('保存长图')
const showSaveCard = ref(false)
const showSaveModal = ref(false)
const showWxGuide = ref(false)
const showTipQR = ref(false)
const savedImageUrl = ref('')
const radarImageUrl = ref('')

// 广告
const adsReady = ref(false)
onMounted(() => {
  // 检测 AdSense 是否加载成功
  if (window.adsbygoogle && typeof window.adsbygoogle.push === 'function') {
    adsReady.value = true
    try {
      const ads = document.querySelectorAll('.adsbygoogle')
      ads.forEach(ad => {
        if (!ad.dataset.adsbygoogleStatus) {
          (window.adsbygoogle = window.adsbygoogle || []).push({})
        }
      })
    } catch (e) {}
  }
})

const isWeChat = /MicroMessenger/i.test(navigator.userAgent)
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
const testUrl = computed(() => window.location.origin + window.location.pathname)

// 人格 emoji
const emoji = computed(() => typeEmojis[props.result.type.code] || '🧩')

// 插画区背景
const illustrationStyle = computed(() => {
  const colors = typeBgColors[props.result.type.code] || ['#f0ece8', '#e4ddd5']
  return { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` }
})

// 匹配描述文案
const matchDescription = computed(() => {
  if (props.result.isDrunk) return '你触发了隐藏人格，酒精令你信服。'
  if (props.result.isHHHH) return '你的思维回路过于清奇，标准人格库无法匹配。'
  const s = props.result.similarity || 0
  if (s >= 0.8) return '维度命中度非常高，当前结果高度匹配你的人格画像。'
  if (s >= 0.65) return '维度命中度较高，当前结果可视为你的第一人格画像。'
  return '维度有一定匹配，结果具有参考价值。'
})

const chartSize = computed(() => (typeof window !== 'undefined' && window.innerWidth < 400) ? 300 : 340)

const radarData = computed(() =>
  dimensionOrder.map(dim => ({
    name: dimensions[dim].name,
    value: props.result.levels[dim] === 'L' ? 1 : props.result.levels[dim] === 'M' ? 2 : 3
  }))
)

// 维度详解 — 带原始分数
const dimensionExplanations = computed(() =>
  getDimensionExplanations(props.result.levels).map(item => ({
    ...item,
    shortLabel: item.name.replace(/^(S\d|E\d|A\d|Ac\d|So\d)\s/, ''),
    dim: item.name.match(/^(S\d|E\d|A\d|Ac\d|So\d)/)?.[0] || item.dim,
    rawScore: props.result.sums?.[item.dim] ?? '?'
  }))
)

// ---- 保存长图 ----
async function saveImage() {
  if (isSaving.value) return
  isSaving.value = true
  saveText.value = '生成中...'
  trackEvent('save_image', props.result.type.code)
  try {
    const radarCanvas = radarChartRef.value?.canvasRef
    if (radarCanvas) radarImageUrl.value = radarCanvas.toDataURL('image/png')

    showSaveCard.value = true
    await nextTick()
    await new Promise(r => setTimeout(r, 100))

    const cardEl = resultCardRef.value?.$el
    if (!cardEl) throw new Error('Card not found')

    const canvas = await html2canvas(cardEl, {
      scale: 2,
      backgroundColor: '#f8f6f3',
      useCORS: true,
      logging: false
    })
    savedImageUrl.value = canvas.toDataURL('image/png')
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

function downloadImage() {
  if (!savedImageUrl.value) return
  const link = document.createElement('a')
  link.download = `SBTI-${props.result.type.code}-${props.result.type.cn}.png`
  link.href = savedImageUrl.value
  link.click()
}

// ---- GA 事件追踪 ----
function trackEvent(action, label) {
  if (window.gtag) window.gtag('event', action, { event_category: 'sbti', event_label: label })
}

// 页面加载时追踪结果
onMounted(() => {
  trackEvent('view_result', props.result.type.code)
})

// ---- 复制链接 ----
async function copyLink() {
  trackEvent('copy_link', props.result.type.code)
  try {
    await navigator.clipboard.writeText('SBTI人格测试，快来测测你是什么抽象人格！' + '\n' + window.location.origin)
    alert('链接已复制，快去分享给好友吧！')
  } catch {
    prompt('复制链接分享给好友：', window.location.origin)
  }
}

// ---- 分享 ----
async function handleShare() {
  trackEvent('share', props.result.type.code)
  if (isWeChat) { showWxGuide.value = true; return }
  const shareData = {
    title: `我的SBTI人格：【${props.result.type.code}】${props.result.type.cn}`,
    text: `"${props.result.type.intro}" - 快来测测你的SBTI人格吧！`,
    url: window.location.href
  }
  if (navigator.share) {
    try { await navigator.share(shareData); return } catch {}
  }
  const text = `我的SBTI人格测试结果：\n【${props.result.type.code}】${props.result.type.cn}\n"${props.result.type.intro}"\n维度模式：${props.result.userPattern}\n${window.location.href}`
  try {
    await navigator.clipboard.writeText(text)
    alert('分享文案已复制到剪贴板，去粘贴给好友吧！')
  } catch {
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

/* ===== 英雄头图区 ===== */
.hero-card {
  display: flex;
  gap: 0;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  animation: fadeInUp 0.5s ease-out;
}

.hero-illustration {
  flex: 0 0 45%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  gap: 16px;
  min-height: 240px;
}

.hero-emoji {
  font-size: 80px;
  line-height: 1;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.08));
}

.hero-intro {
  font-size: 13px;
  color: var(--accent);
  text-align: center;
  line-height: 1.6;
  max-width: 180px;
}

.hero-info {
  flex: 1;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-label {
  font-size: 13px;
  color: var(--accent);
  font-weight: 500;
  margin-bottom: 8px;
}

.hero-type-name {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.3;
  margin-bottom: 12px;
}

.hero-tags {
  margin-bottom: 12px;
}

.hero-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 14px;
  background: var(--accent-light);
  color: var(--accent);
}

.hero-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 520px) {
  .hero-card { flex-direction: column; }
  .hero-illustration { flex: none; min-height: 180px; }
  .hero-info { padding: 20px 24px 28px; }
  .hero-type-name { font-size: 22px; }
}

/* ===== 通用卡片 ===== */
.section-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  animation: fadeInUp 0.5s ease-out;
}

.section-title {
  font-size: 17px;
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

/* ===== 十五维度评分 ===== */
.dimensions-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.dim-item {
  padding: 14px 4px;
  border-bottom: 1px solid var(--border-color);
}
.dim-item:last-child { border-bottom: none; }

.dim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.dim-name {
  font-size: 14px;
  color: var(--text-primary);
}
.dim-name strong {
  font-weight: 700;
  margin-right: 4px;
}

.dim-score {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}
.score-L { color: #c0614e; }
.score-M { color: #b8920a; }
.score-H { color: var(--accent); }

.dim-explain {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* ===== 维度模式 ===== */
.pattern-display {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  color: var(--accent);
  letter-spacing: 3px;
  padding: 14px;
  background: var(--accent-light);
  border-radius: 10px;
}

/* ===== 副人格 ===== */
.secondary-type {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 10px;
}
.secondary-code { font-weight: 700; color: var(--accent); font-size: 16px; }
.secondary-name { color: var(--text-primary); font-size: 15px; }
.secondary-sim { margin-left: auto; font-size: 13px; color: var(--text-secondary); }

/* ===== 排行 ===== */
.ranking-list { display: flex; flex-direction: column; gap: 8px; }

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-primary);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}
.ranking-item.is-best { border-color: var(--accent); background: var(--accent-light); }

.rank-num { font-size: 13px; font-weight: 700; color: var(--text-muted); width: 28px; }
.is-best .rank-num { color: var(--accent); }
.rank-code { font-weight: 700; color: var(--accent); width: 70px; font-size: 14px; }
.rank-name { flex: 1; font-size: 14px; color: var(--text-primary); }
.rank-sim { font-size: 13px; color: var(--text-secondary); font-weight: 600; }

/* ===== 底部操作 ===== */
.bottom-actions { display: flex; gap: 10px; margin-top: 24px; margin-bottom: 24px; }

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
  background: var(--accent-gradient);
  color: #fff;
}
.save-img-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.save-img-btn:disabled { opacity: 0.6; cursor: wait; }

.share-btn {
  background: linear-gradient(135deg, #e8a849, #d4903a);
  color: #fff;
}
.share-btn:hover { opacity: 0.9; transform: translateY(-1px); }

.restart-btn {
  background: var(--card-bg);
  border: 2px solid var(--border-color) !important;
  color: var(--text-primary);
}
.restart-btn:hover { border-color: var(--accent) !important; color: var(--accent); }

.btn-loading {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ===== 离屏 / 弹窗 / 引导 ===== */
.offscreen-area { position: fixed; left: -9999px; top: 0; z-index: -1; pointer-events: none; }

.save-modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  animation: fadeIn 0.25s ease-out;
}
.save-modal {
  background: #fff; border-radius: 16px;
  width: 100%; max-width: 420px; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
}
.save-modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid var(--border-color);
}
.save-modal-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.save-modal-close {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  background: none; border: none; color: var(--text-muted); font-size: 24px;
  cursor: pointer; border-radius: 8px;
}
.save-modal-close:hover { background: var(--bg-secondary); }
.save-modal-body {
  flex: 1; overflow-y: auto; padding: 16px;
  display: flex; justify-content: center; -webkit-overflow-scrolling: touch;
}
.save-modal-img { width: 100%; max-width: 375px; height: auto; border-radius: 8px; }
.save-modal-footer { padding: 12px 20px 16px; text-align: center; border-top: 1px solid var(--border-color); }
.save-modal-hint { font-size: 14px; color: var(--text-secondary); }
.save-modal-download {
  padding: 10px 32px; font-size: 14px; font-weight: 600;
  background: var(--accent-gradient); color: #fff; border: none; border-radius: 10px; cursor: pointer;
}

.wx-guide-overlay {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,0.88);
  display: flex; flex-direction: column; align-items: flex-end;
  padding-top: 16px; padding-right: 20px;
  animation: fadeIn 0.25s ease-out;
}
.wx-guide-arrow { animation: bounceUp 1s ease-in-out infinite; }
.wx-guide-text { font-size: 18px; color: #fff; text-align: right; line-height: 1.8; margin-top: 12px; padding-right: 4px; }
.wx-guide-text strong { color: #43e97b; }
.wx-guide-dismiss { position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); font-size: 14px; color: #888; }

/* ===== 邀请好友卡片 ===== */
.invite-card {
  text-align: center;
  background: var(--accent-gradient);
  border-radius: 16px;
  padding: 28px 24px;
  margin-bottom: 16px;
  color: #fff;
}
.invite-text { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
.invite-sub { font-size: 13px; opacity: 0.85; margin-bottom: 18px; }
.invite-btn {
  padding: 12px 32px; font-size: 15px; font-weight: 600;
  background: #fff; color: var(--accent); border: none; border-radius: 50px;
  cursor: pointer; transition: all 0.2s;
}
.invite-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }

/* ===== 打赏区 ===== */
.tip-card {
  text-align: center;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 16px;
}
.tip-text { font-size: 15px; color: var(--text-primary); margin-bottom: 14px; }
.tip-btn {
  padding: 10px 32px; font-size: 14px; font-weight: 600;
  background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff;
  border: none; border-radius: 50px; cursor: pointer; transition: all 0.2s;
}
.tip-btn:hover { transform: translateY(-1px); opacity: 0.9; }
.tip-qr-row { display: flex; justify-content: center; gap: 32px; margin-bottom: 14px; }
.tip-qr-item { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary); }
.tip-qr-img { width: 180px; height: 180px; border-radius: 8px; border: 1px solid var(--border-color); object-fit: contain; }
.tip-close {
  font-size: 13px; color: var(--text-muted); background: none; border: none; cursor: pointer;
  text-decoration: underline;
}

.ad-slot { margin-bottom: 16px; min-height: 100px; overflow: hidden; }

.footer-disclaimer { text-align: center; font-size: 12px; color: var(--text-muted); line-height: 1.8; }

@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes bounceUp { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

@media (max-width: 420px) {
  .bottom-actions { flex-wrap: wrap; }
  .save-img-btn, .share-btn { flex: 1 1 45%; }
  .restart-btn { flex: 1 1 100%; }
}
</style>
