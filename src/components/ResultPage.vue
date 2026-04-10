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
      <RadarChart :data="radarData" :size="chartSize" />
    </div>

    <!-- 维度详解 -->
    <div class="section-card">
      <h2 class="section-title">十五维度详解</h2>
      <div class="dimensions-list">
        <div
          v-for="(item, idx) in dimensionExplanations"
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

    <!-- 底部操作 -->
    <div class="bottom-actions">
      <button class="restart-btn" @click="$emit('restart')">
        重新测试
      </button>
      <button class="share-btn" @click="copyResult">
        {{ copyText }}
      </button>
    </div>

    <p class="footer-disclaimer">
      SBTI 人格测试仅供娱乐，请勿当真。<br>
      原创：B站 @蛆肉儿串儿
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import RadarChart from './RadarChart.vue'
import { getDimensionExplanations } from '../engine/scoring.js'
import { dimensionOrder, dimensions } from '../data/dimensions.js'

const props = defineProps({
  result: { type: Object, required: true }
})

defineEmits(['restart'])

const copyText = ref('复制结果')

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

async function copyResult() {
  const text = `我的SBTI人格测试结果：\n【${props.result.type.code}】${props.result.type.cn}\n"${props.result.type.intro}"\n维度模式：${props.result.userPattern}\n快来测测你的人格吧！`
  try {
    await navigator.clipboard.writeText(text)
    copyText.value = '已复制!'
    setTimeout(() => { copyText.value = '复制结果' }, 2000)
  } catch {
    copyText.value = '复制失败'
    setTimeout(() => { copyText.value = '复制结果' }, 2000)
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

.level-L {
  background: rgba(245, 87, 108, 0.12);
  color: #f5576c;
}

.level-M {
  background: rgba(255, 184, 0, 0.12);
  color: #e6a700;
}

.level-H {
  background: rgba(0, 200, 150, 0.12);
  color: #00c896;
}

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

.secondary-code {
  font-weight: 700;
  color: #667eea;
  font-size: 16px;
}

.secondary-name {
  color: var(--text-primary);
  font-size: 15px;
}

.secondary-sim {
  margin-left: auto;
  font-size: 13px;
  color: var(--text-secondary);
}

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

.rank-num {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  width: 28px;
}

.is-best .rank-num {
  color: #667eea;
}

.rank-code {
  font-weight: 700;
  color: #667eea;
  width: 70px;
  font-size: 14px;
}

.rank-name {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.rank-sim {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
}

/* 底部操作 */
.bottom-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  margin-bottom: 24px;
}

.restart-btn, .share-btn {
  flex: 1;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.restart-btn {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  color: var(--text-primary);
}

.restart-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.share-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: #fff;
}

.share-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.footer-disclaimer {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.8;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}
</style>
