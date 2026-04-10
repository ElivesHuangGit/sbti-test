<template>
  <div class="save-card" ref="cardRef">
    <!-- 头部 -->
    <div class="card-header">
      <div class="card-logo">SBTI</div>
      <div class="card-tagline">人格测试结果</div>
    </div>

    <!-- 人格徽章 -->
    <div class="card-type-section">
      <div class="card-badge" :class="badgeClass">
        <span>{{ result.type.code }}</span>
      </div>
      <div class="card-type-name">{{ result.type.cn }}</div>
      <div class="card-intro">"{{ result.type.intro }}"</div>
      <div class="card-match" v-if="matchText">{{ matchText }}</div>
    </div>

    <!-- 雷达图 -->
    <div class="card-radar" v-if="radarImage">
      <img :src="radarImage" class="card-radar-img" />
    </div>

    <!-- 维度模式 -->
    <div class="card-pattern">{{ result.userPattern }}</div>

    <!-- 维度一览 -->
    <div class="card-dims">
      <div v-for="group in dimGroups" :key="group.model" class="card-dim-group">
        <div class="card-dim-model">{{ group.model }}</div>
        <div class="card-dim-pills">
          <span
            v-for="d in group.dims"
            :key="d.dim"
            class="card-dim-pill"
            :class="'pill-' + d.level"
          >{{ d.dim }} {{ d.level }}</span>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <div class="card-footer">
      <div class="card-cta">快来测测你的 SBTI 人格吧!</div>
      <div class="card-url">{{ testUrl }}</div>
      <div class="card-disclaimer">仅供娱乐 请勿当真 | 原创: B站 @蛆肉儿串儿</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { dimensionOrder } from '../data/dimensions.js'

const props = defineProps({
  result: { type: Object, required: true },
  radarImage: { type: String, default: '' },
  testUrl: { type: String, default: '' }
})

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
    dims: g.dims.map(d => ({
      dim: d,
      level: props.result.levels[d]
    }))
  }))
})
</script>

<style scoped>
/* 使用硬编码颜色，确保 html2canvas 正确渲染 */
.save-card {
  width: 375px;
  background: linear-gradient(180deg, #0f0f18 0%, #161625 50%, #0f0f18 100%);
  color: #e8e8f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  padding: 32px 24px;
  box-sizing: border-box;
}

/* 头部 */
.card-header {
  text-align: center;
  margin-bottom: 28px;
}

.card-logo {
  font-size: 36px;
  font-weight: 900;
  letter-spacing: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.card-tagline {
  font-size: 13px;
  color: #7a7a8e;
  letter-spacing: 3px;
  margin-top: 4px;
}

/* 人格徽章 */
.card-type-section {
  text-align: center;
  margin-bottom: 24px;
}

.card-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin-bottom: 14px;
  font-size: 20px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 1px;
}

.badge-normal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.badge-drunk {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
.badge-hhhh {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.card-type-name {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 6px;
}

.card-intro {
  font-size: 14px;
  color: #9898a8;
  font-style: italic;
  margin-bottom: 8px;
  padding: 0 12px;
}

.card-match {
  display: inline-block;
  font-size: 12px;
  padding: 3px 14px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
}

/* 雷达图 */
.card-radar {
  text-align: center;
  margin: 16px 0;
}

.card-radar-img {
  width: 280px;
  height: 280px;
}

/* 维度模式 */
.card-pattern {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  color: #667eea;
  letter-spacing: 2px;
  padding: 12px;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 10px;
  margin-bottom: 20px;
}

/* 维度一览 */
.card-dims {
  margin-bottom: 24px;
}

.card-dim-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.card-dim-model {
  font-size: 11px;
  color: #7a7a8e;
  width: 60px;
  flex-shrink: 0;
  text-align: right;
}

.card-dim-pills {
  display: flex;
  gap: 6px;
  flex: 1;
}

.card-dim-pill {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 8px;
  flex: 1;
  text-align: center;
}

.pill-L {
  background: rgba(245, 87, 108, 0.15);
  color: #f5576c;
}
.pill-M {
  background: rgba(255, 184, 0, 0.15);
  color: #e6a700;
}
.pill-H {
  background: rgba(0, 200, 150, 0.15);
  color: #00c896;
}

/* 底部 */
.card-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #2a2a3a;
}

.card-cta {
  font-size: 14px;
  font-weight: 600;
  color: #e8e8f0;
  margin-bottom: 6px;
}

.card-url {
  font-size: 12px;
  color: #667eea;
  margin-bottom: 8px;
  word-break: break-all;
}

.card-disclaimer {
  font-size: 10px;
  color: #5a5a6e;
}
</style>
